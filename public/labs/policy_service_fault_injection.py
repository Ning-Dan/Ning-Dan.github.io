"""Fault-injection lab for a versioned policy-service client.

The policy server is treated as an untrusted action proposer.  The client
checks schema/time semantics, skips expired action prefixes, clips commands,
and enters a controlled stop on TTL or watchdog failure.

This deterministic simulation uses only the Python standard library.
Run: python public/labs/policy_service_fault_injection.py
"""

from __future__ import annotations

from dataclasses import dataclass
from math import ceil, isfinite
from typing import Sequence


def percentile_nearest_rank(values: Sequence[float], quantile: float) -> float:
    if not values or not 0.0 < quantile <= 1.0:
        raise ValueError("non-empty values and quantile in (0, 1] required")
    ordered = sorted(float(value) for value in values)
    return ordered[ceil(quantile * len(ordered)) - 1]


def reserve_actions(inference_p99_ms: float, network_p99_ms: float, margin_ms: float, action_dt_ms: float) -> int:
    if min(inference_p99_ms, network_p99_ms, margin_ms) < 0 or action_dt_ms <= 0:
        raise ValueError("latencies must be nonnegative and action_dt_ms positive")
    return ceil((inference_p99_ms + network_p99_ms + margin_ms) / action_dt_ms)


@dataclass(frozen=True)
class ActionChunk:
    schema_version: str
    request_id: int
    observation_time_ms: int
    action_dt_ms: int
    command_type: str
    frame: str
    linear_unit: str
    actions: tuple[tuple[float, ...], ...]


class SafePolicyClient:
    def __init__(self, *, ttl_ms: int = 250, watchdog_ms: int = 120, max_abs_delta: float = 0.05) -> None:
        self.ttl_ms = ttl_ms
        self.watchdog_ms = watchdog_ms
        self.max_abs_delta = max_abs_delta
        self.last_valid_message_ms: int | None = None
        self.last_request_id = -1
        self.mode = "CONTROLLED_STOP"
        self.events: list[str] = []

    def _stop(self, reason: str) -> None:
        self.mode = "CONTROLLED_STOP"
        self.events.append(f"STOP:{reason}")

    def _validate_contract(self, chunk: ActionChunk) -> None:
        if chunk.schema_version != "v1":
            raise ValueError("schema_version")
        if chunk.command_type != "eef_delta" or chunk.frame != "base":
            raise ValueError("command_type/frame")
        if chunk.linear_unit != "m" or chunk.action_dt_ms <= 0:
            raise ValueError("unit/dt")
        if not chunk.actions or any(len(action) != 2 for action in chunk.actions):
            raise ValueError("action shape")
        if not all(isfinite(value) for action in chunk.actions for value in action):
            raise ValueError("non-finite action")

    def receive(self, chunk: ActionChunk, now_ms: int) -> tuple[float, ...] | None:
        try:
            self._validate_contract(chunk)
        except ValueError as error:
            self.events.append(f"REJECT:{error}")
            return None

        age_ms = now_ms - chunk.observation_time_ms
        if age_ms < 0:
            self.events.append("REJECT:future observation clock")
            return None
        if age_ms > self.ttl_ms:
            self._stop("chunk TTL expired")
            return None
        if chunk.request_id <= self.last_request_id:
            self.events.append("REJECT:stale request_id")
            return None

        # Each action i is anchored at observation_time + i * dt.  Skip every
        # prefix action whose intended time has already passed; never replay it.
        first_live_index = ceil(age_ms / chunk.action_dt_ms)
        if first_live_index >= len(chunk.actions):
            self._stop("no live action remains")
            return None

        raw_action = chunk.actions[first_live_index]
        safe_action = tuple(max(-self.max_abs_delta, min(self.max_abs_delta, value)) for value in raw_action)
        self.last_request_id = chunk.request_id
        self.last_valid_message_ms = now_ms
        self.mode = "ACTIVE"
        self.events.append(f"ACCEPT:{chunk.request_id}:skip={first_live_index}:action={safe_action}")
        return safe_action

    def watchdog(self, now_ms: int) -> bool:
        if self.last_valid_message_ms is None or now_ms - self.last_valid_message_ms > self.watchdog_ms:
            self._stop("watchdog timeout")
            return False
        return True


def make_chunk(
    *, request_id: int = 7, observation_time_ms: int = 1000, schema_version: str = "v1"
) -> ActionChunk:
    return ActionChunk(
        schema_version=schema_version,
        request_id=request_id,
        observation_time_ms=observation_time_ms,
        action_dt_ms=50,
        command_type="eef_delta",
        frame="base",
        linear_unit="m",
        actions=((0.01, -0.01), (0.02, -0.02), (0.20, -0.20), (0.03, -0.03), (0.01, -0.01)),
    )


def smoke_test() -> None:
    inference_ms = [92, 105, 110, 118, 126, 135, 145, 160, 175, 190]
    network_ms = [18, 20, 22, 25, 28, 30, 34, 40, 48, 55]
    inference_p99 = percentile_nearest_rank(inference_ms, 0.99)
    network_p99 = percentile_nearest_rank(network_ms, 0.99)
    reserve = reserve_actions(inference_p99, network_p99, margin_ms=30, action_dt_ms=50)
    assert (inference_p99, network_p99, reserve) == (190.0, 55.0, 6)

    client = SafePolicyClient(ttl_ms=250, watchdog_ms=120, max_abs_delta=0.05)

    # At 1060 ms, action indices 0 and 1 are already in the past.  Index 2 is
    # selected and then clipped from +/-0.20 to +/-0.05.
    action = client.receive(make_chunk(), now_ms=1060)
    assert action == (0.05, -0.05)
    assert client.mode == "ACTIVE"

    # A protocol mismatch is rejected without replacing the last valid chunk.
    assert client.receive(make_chunk(request_id=8, schema_version="v2"), now_ms=1070) is None
    assert client.mode == "ACTIVE"

    # An old/out-of-order response is rejected even if its timestamp is recent.
    assert client.receive(make_chunk(request_id=6, observation_time_ms=1060), now_ms=1080) is None

    # Liveness is independent of message TTL: no valid heartbeat causes stop.
    assert client.watchdog(1180)
    assert not client.watchdog(1181)
    assert client.mode == "CONTROLLED_STOP"

    # A response older than its TTL also causes a controlled stop and no action.
    assert client.receive(make_chunk(request_id=9), now_ms=1300) is None
    assert client.mode == "CONTROLLED_STOP"

    print(f"p99 latency: inference={inference_p99:.0f} ms, network={network_p99:.0f} ms, reserve={reserve} actions")
    for event in client.events:
        print(event)
    print("PASS: schema mismatch, stale response, prefix expiry, clipping, TTL and watchdog were exercised")
    print("BOUNDARY: this simulation is not a certified safety controller and does not check robot collisions or dynamics")


if __name__ == "__main__":
    smoke_test()
