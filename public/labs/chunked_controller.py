"""Timestamped action queue with latency, TTL and controlled stop.

Run: python public/labs/chunked_controller.py
"""
from __future__ import annotations

import heapq
import math
from dataclasses import dataclass, field
from typing import Sequence


def percentile(values: Sequence[float], q: float) -> float:
    if not values or not 0 < q <= 1: raise ValueError("values and q required")
    ordered = sorted(values); return ordered[max(0, math.ceil(q*len(ordered))-1)]


@dataclass(frozen=True)
class ActionChunk:
    request_id: int
    observation_time: float
    dt: float
    targets: tuple[float, ...]

    def validate(self) -> None:
        if self.dt <= 0 or not self.targets or not all(math.isfinite(x) for x in self.targets):
            raise ValueError("finite non-empty chunk and positive dt required")


@dataclass(order=True)
class InFlight:
    arrival_time: float
    chunk: ActionChunk = field(compare=False)


class DelayedNetwork:
    def __init__(self) -> None: self.heap: list[InFlight] = []
    def send(self, chunk: ActionChunk, latency: float) -> None:
        if latency < 0: raise ValueError("negative latency")
        heapq.heappush(self.heap, InFlight(chunk.observation_time+latency, chunk))
    def ready(self, now: float) -> list[ActionChunk]:
        result = []
        while self.heap and self.heap[0].arrival_time <= now: result.append(heapq.heappop(self.heap).chunk)
        return result


class SafeExecutor:
    def __init__(self, *, ttl: float=.18, max_step: float=.08) -> None:
        self.ttl, self.max_step = ttl, max_step
        self.position = 0.0; self.active: ActionChunk | None = None; self.index = 0
        self.latest_observation_time = -math.inf; self.rejected_stale = 0; self.controlled_stops = 0

    def receive(self, chunk: ActionChunk, now: float) -> bool:
        chunk.validate(); age = now-chunk.observation_time
        if age > self.ttl or chunk.observation_time <= self.latest_observation_time:
            self.rejected_stale += 1; return False
        self.active, self.index, self.latest_observation_time = chunk, 0, chunk.observation_time
        return True

    def tick(self, now: float) -> float:
        chunk = self.active
        if chunk is None or now-chunk.observation_time > self.ttl or self.index >= len(chunk.targets):
            self.active = None; self.controlled_stops += 1
            return self.position  # controlled stop = hold, never replay an old action
        target = chunk.targets[self.index]; self.index += 1
        delta = max(-self.max_step, min(self.max_step, target-self.position))
        self.position += delta
        assert math.isfinite(self.position)
        return self.position


def goal_chunk(observation: float, goal: float, *, request_id: int, observation_time: float, horizon: int=8, dt: float=.05) -> ActionChunk:
    if horizon <= 0: raise ValueError("positive horizon required")
    step = (goal-observation)/horizon
    return ActionChunk(request_id, observation_time, dt, tuple(observation+step*(i+1) for i in range(horizon)))


def main() -> None:
    # Measured/injected end-to-end latency samples, seconds.
    latencies = [.01,.02,.025,.03,.035,.04,.045,.05,.08,.22]
    p99 = percentile(latencies, .99); margin=.03; dt=.05
    reserve = math.ceil((p99+margin)/dt)
    assert p99 == .22 and reserve == 5

    network = DelayedNetwork(); executor = SafeExecutor(ttl=.18, max_step=.08)
    first = goal_chunk(0, 1, request_id=1, observation_time=0, dt=dt)
    network.send(first, latency=.04)
    assert network.ready(.03) == []
    delivered = network.ready(.04); assert len(delivered)==1 and executor.receive(delivered[0], .04)
    states = [executor.tick(t) for t in (.05,.10,.15)]
    assert states == [.08,.16,.24]  # targets are limited by max_step
    held = executor.tick(.20)  # age > TTL: controlled stop
    assert held == .24 and executor.controlled_stops == 1

    newer = goal_chunk(.24, 1, request_id=3, observation_time=.21, dt=dt)
    assert executor.receive(newer, .25)
    older_late = goal_chunk(.16, 1, request_id=2, observation_time=.10, dt=dt)
    assert not executor.receive(older_late, .26)  # late/out-of-order chunk cannot replace newer state
    assert executor.rejected_stale == 1
    assert executor.tick(.26) > held

    try: executor.receive(ActionChunk(4,.3,dt,(math.nan,)), .3)
    except ValueError: pass
    else: raise AssertionError("NaN action accepted")

    print(f"latency p99={p99*1000:.0f} ms; reserve={reserve} actions at {dt*1000:.0f} ms/action")
    print("limited states:", states, "controlled-stop hold:", held)
    print("stale/out-of-order rejected:", executor.rejected_stale, "controlled stops:", executor.controlled_stops)
    print("timestamp + TTL + p99 + NaN checks: PASS")
    print("chunked controller: ALL CHECKS PASSED")


if __name__ == "__main__": main()
