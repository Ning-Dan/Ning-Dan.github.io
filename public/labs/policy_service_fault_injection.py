"""Fault-injection lab for an asynchronous policy-service action queue.

The policy server is an untrusted action proposer.  The client validates the
contract, skips actions whose scheduled execution time has passed, queues the
remaining actions, clips commands, and enters a controlled stop on TTL or
watchdog failure.

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


def reserve_actions(latency_budget_ms: float, margin_ms: float, action_dt_ms: float) -> int:
    if min(latency_budget_ms, margin_ms) < 0 or action_dt_ms <= 0:
        raise ValueError("latencies must be nonnegative and action_dt_ms positive")
    return ceil((latency_budget_ms + margin_ms) / action_dt_ms)


def assert_queue_feasible(horizon: int, execution_horizon: int, reserve: int) -> None:
    if min(horizon, execution_horizon, reserve) <= 0 or execution_horizon > horizon:
        raise ValueError("positive H/E/reserve with E <= H required")
    if horizon - execution_horizon < reserve:
        raise ValueError(f"queue infeasible: H-E={horizon-execution_horizon} < reserve={reserve}")


@dataclass(frozen=True)
class ActionChunk:
    schema_version: str
    request_id: int
    based_on_observation_time_ms: int
    clock_id: str
    action_start_time_ms: int
    action_dt_ms: int
    command_type: str
    frame: str
    linear_unit: str
    normalization_revision: str
    action_contract_revision: str
    actions: tuple[tuple[float, ...], ...]
    valid: tuple[tuple[bool, ...], ...]


class SafePolicyClient:
    def __init__(self, *, ttl_ms: int = 250, watchdog_ms: int = 120, max_abs_delta: float = 0.05) -> None:
        self.ttl_ms = ttl_ms
        self.watchdog_ms = watchdog_ms
        self.max_abs_delta = max_abs_delta
        self.last_valid_message_ms: int | None = None
        self.last_request_id = -1
        self.queue: list[tuple[int, tuple[float, ...]]] = []
        self.mode = "CONTROLLED_STOP"
        self.events: list[str] = []

    def _stop(self, reason: str) -> None:
        self.queue.clear()
        self.mode = "CONTROLLED_STOP"
        self.events.append(f"STOP:{reason}")

    def _validate_contract(self, chunk: ActionChunk) -> None:
        if chunk.schema_version != "v1":
            raise ValueError("schema_version")
        if chunk.clock_id != "robot-monotonic-ms":
            raise ValueError("clock_id")
        if chunk.command_type != "eef_delta" or chunk.frame != "base":
            raise ValueError("command_type/frame")
        if chunk.linear_unit != "m" or chunk.action_dt_ms <= 0:
            raise ValueError("unit/dt")
        if chunk.normalization_revision != "physical-v1" or chunk.action_contract_revision != "eef-delta-2d-v1":
            raise ValueError("revision")
        if not chunk.actions or len(chunk.valid) != len(chunk.actions):
            raise ValueError("action/valid shape")
        if any(len(action) != 2 for action in chunk.actions) or any(len(mask) != 2 for mask in chunk.valid):
            raise ValueError("action/valid shape")
        if not all(all(mask) for mask in chunk.valid):
            raise ValueError("invalid action element")
        if not all(isfinite(value) for action in chunk.actions for value in action):
            raise ValueError("non-finite action")

    def receive(self, chunk: ActionChunk, now_ms: int) -> bool:
        try:
            self._validate_contract(chunk)
        except ValueError as error:
            self.events.append(f"REJECT:{error}")
            return False

        observation_age_ms = now_ms - chunk.based_on_observation_time_ms
        if observation_age_ms < 0:
            self.events.append("REJECT:future observation clock")
            return False
        if observation_age_ms > self.ttl_ms:
            self._stop("chunk TTL expired")
            return False
        if chunk.request_id <= self.last_request_id:
            self.events.append("REJECT:stale request_id")
            return False

        # action i is scheduled for action_start_time + i*dt.  observation_time
        # is used for freshness; it is deliberately not reused as a schedule.
        first_live_index = max(0, ceil((now_ms - chunk.action_start_time_ms) / chunk.action_dt_ms))
        if first_live_index >= len(chunk.actions):
            self._stop("no live action remains")
            return False

        self.queue = [
            (chunk.action_start_time_ms + index * chunk.action_dt_ms, action)
            for index, action in enumerate(chunk.actions[first_live_index:], start=first_live_index)
        ]
        self.last_request_id = chunk.request_id
        self.last_valid_message_ms = now_ms
        self.mode = "ACTIVE"
        self.events.append(f"ACCEPT:{chunk.request_id}:skip={first_live_index}:queued={len(self.queue)}")
        return True

    def tick(self, now_ms: int) -> tuple[float, ...] | None:
        while self.queue and self.queue[0][0] < now_ms:
            missed_time, _ = self.queue.pop(0)
            self.events.append(f"DROP:missed_action:{missed_time}")
        if not self.queue or self.queue[0][0] > now_ms:
            return None
        _, raw_action = self.queue.pop(0)
        safe_action = tuple(max(-self.max_abs_delta, min(self.max_abs_delta, value)) for value in raw_action)
        self.events.append(f"EXEC:{now_ms}:action={safe_action}:remaining={len(self.queue)}")
        return safe_action

    def watchdog(self, now_ms: int) -> bool:
        if self.last_valid_message_ms is None or now_ms - self.last_valid_message_ms > self.watchdog_ms:
            self._stop("watchdog timeout")
            return False
        return True


def make_chunk(
    *, request_id: int = 7, observation_time_ms: int = 1000, action_start_time_ms: int = 1000,
    schema_version: str = "v1", horizon: int = 16,
) -> ActionChunk:
    base = ((0.01, -0.01), (0.02, -0.02), (0.20, -0.20), (0.03, -0.03))
    actions = tuple(base[index % len(base)] for index in range(horizon))
    return ActionChunk(
        schema_version=schema_version,
        request_id=request_id,
        based_on_observation_time_ms=observation_time_ms,
        clock_id="robot-monotonic-ms",
        action_start_time_ms=action_start_time_ms,
        action_dt_ms=50,
        command_type="eef_delta",
        frame="base",
        linear_unit="m",
        normalization_revision="physical-v1",
        action_contract_revision="eef-delta-2d-v1",
        actions=actions,
        valid=tuple((True, True) for _ in actions),
    )


def smoke_test() -> None:
    inference_ms = [92, 105, 110, 118, 126, 135, 145, 160, 175, 190]
    network_ms = [18, 20, 22, 25, 28, 30, 34, 40, 48, 55]
    end_to_end_ms = [118, 130, 145, 152, 166, 180, 205, 225, 248, 270]
    inference_p99 = percentile_nearest_rank(inference_ms, 0.99)
    network_p99 = percentile_nearest_rank(network_ms, 0.99)
    end_to_end_p99 = percentile_nearest_rank(end_to_end_ms, 0.99)
    component_heuristic = reserve_actions(inference_p99 + network_p99, margin_ms=30, action_dt_ms=50)
    measured_reserve = reserve_actions(end_to_end_p99, margin_ms=30, action_dt_ms=50)
    assert (inference_p99, network_p99, end_to_end_p99) == (190.0, 55.0, 270.0)
    assert component_heuristic == measured_reserve == 6

    horizon, execution_horizon = 16, 4
    assert_queue_feasible(horizon, execution_horizon, measured_reserve)
    try:
        assert_queue_feasible(5, execution_horizon, measured_reserve)
    except ValueError as error:
        assert "H-E=1 < reserve=6" in str(error)
    else:
        raise AssertionError("infeasible H/E/reserve was accepted")

    client = SafePolicyClient(ttl_ms=250, watchdog_ms=120, max_abs_delta=0.05)

    # At 1060 ms, actions scheduled for 1000 and 1050 are in the past.  The
    # remaining 14 actions are queued; index 2 is clipped when executed at 1100.
    assert client.receive(make_chunk(horizon=horizon), now_ms=1060)
    assert len(client.queue) == 14 and client.mode == "ACTIVE"
    assert client.tick(1100) == (0.05, -0.05)
    assert len(client.queue) == 13

    # A protocol mismatch and an old response are rejected without replacing
    # the remaining valid queue.
    assert not client.receive(make_chunk(request_id=8, schema_version="v2"), now_ms=1070)
    assert client.mode == "ACTIVE" and len(client.queue) == 13
    assert not client.receive(make_chunk(request_id=6, observation_time_ms=1060), now_ms=1080)

    # Liveness is independent of message TTL: no valid message causes stop.
    assert client.watchdog(1180)
    assert not client.watchdog(1181)
    assert client.mode == "CONTROLLED_STOP" and not client.queue

    # A response older than its TTL also causes a controlled stop and no queue.
    assert not client.receive(make_chunk(request_id=9), now_ms=1300)
    assert client.mode == "CONTROLLED_STOP"

    print(
        f"latency p99: end_to_end={end_to_end_p99:.0f} ms, measured_reserve={measured_reserve}; "
        f"component_heuristic={inference_p99:.0f}+{network_p99:.0f}+30 ms -> {component_heuristic} actions"
    )
    print(f"queue feasibility: H={horizon}, E={execution_horizon}, H-E={horizon-execution_horizon} >= reserve={measured_reserve}")
    for event in client.events:
        print(event)
    print("PASS: queue feasibility, schema, stale response, prefix expiry, clipping, TTL and watchdog were exercised")
    print("BOUNDARY: component p99 addition is a budget heuristic, not an end-to-end p99 identity or safety proof")


if __name__ == "__main__":
    smoke_test()
