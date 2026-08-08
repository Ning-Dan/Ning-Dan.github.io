"""Minimal receding-horizon action-chunk executor.

Run: python3 chunked_controller.py
Dependencies: Python 3.10+ standard library only.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, List


@dataclass
class OneDRobot:
    position: float = 0.0

    def observe(self) -> float:
        return self.position

    def command(self, target: float) -> None:
        self.position = float(target)


Policy = Callable[[float, int], List[float]]


def goal_policy(goal: float) -> Policy:
    def predict(observation: float, horizon: int) -> List[float]:
        step = (goal - observation) / horizon
        return [observation + step * (i + 1) for i in range(horizon)]

    return predict


def execute_chunk(
    policy: Policy,
    robot: OneDRobot,
    horizon: int = 8,
    execute: int = 2,
    max_step: float = 0.08,
) -> float:
    """Predict ``horizon`` targets, safely execute the first ``execute``."""
    if not 0 < execute <= horizon:
        raise ValueError("execute must satisfy 0 < execute <= horizon")
    if max_step <= 0:
        raise ValueError("max_step must be positive")

    observation = robot.observe()
    chunk = policy(observation, horizon)
    if len(chunk) != horizon:
        raise ValueError(f"policy returned {len(chunk)} actions; expected {horizon}")

    for target in chunk[:execute]:
        current = robot.position
        delta = max(-max_step, min(max_step, target - current))
        robot.command(current + delta)

    return robot.observe()


def smoke_test() -> None:
    robot = OneDRobot()
    policy = goal_policy(goal=1.0)
    history = [robot.observe()]
    for _ in range(6):
        history.append(execute_chunk(policy, robot))

    assert all(b >= a for a, b in zip(history, history[1:])), history
    assert history[-1] <= 1.0, history
    # The policy replans from the latest state, so its nominal step shrinks as
    # the robot approaches the goal; the exact deterministic result is below.
    assert abs(history[-1] - 0.780625) < 1e-12, history

    try:
        execute_chunk(policy, robot, horizon=2, execute=3)
    except ValueError:
        pass
    else:
        raise AssertionError("invalid execution horizon was not rejected")

    print("closed-loop states:", [round(value, 3) for value in history])
    print("smoke test: PASS")


if __name__ == "__main__":
    smoke_test()
