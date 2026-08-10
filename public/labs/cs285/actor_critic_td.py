#!/usr/bin/env python3
"""A tabular one-step Actor-Critic companion for the Actor-Critic half of HW3."""

from __future__ import annotations

import numpy as np


def sigmoid(value: float) -> float:
    return float(1.0 / (1.0 + np.exp(-value)))


def train(seed: int = 23) -> tuple[np.ndarray, np.ndarray, float]:
    rng = np.random.default_rng(seed)
    terminal = 5
    logits = np.zeros(terminal)
    values = np.zeros(terminal + 1)
    recent_success: list[float] = []

    for episode in range(1800):
        state = 0
        success = 0.0
        for _ in range(14):
            probability_right = sigmoid(logits[state])
            action_right = float(rng.random() < probability_right)
            next_state = int(np.clip(state + (1 if action_right else -1), 0, terminal))
            done = next_state == terminal
            reward = float(done)

            target = reward if done else reward + 0.96 * values[next_state]
            td_error = target - values[state]
            values[state] += 0.10 * td_error
            # d log Bernoulli(a; sigmoid(logit)) / d logit = a - p.
            logits[state] += 0.035 * td_error * (action_right - probability_right)
            state = next_state
            if done:
                success = 1.0
                break
        if episode >= 1600:
            recent_success.append(success)

    probabilities = np.array([sigmoid(value) for value in logits])
    return probabilities, values, float(np.mean(recent_success))


def main() -> None:
    probabilities, values, success_rate = train()
    print(f"P(right) by state: {np.round(probabilities, 3)}")
    print(f"V(s) by state:     {np.round(values, 3)}")
    print(f"last-200 success:  {success_rate:.3f}")

    assert probabilities.min() > 0.70
    assert np.all(np.diff(values[:-1]) >= -0.02)
    assert success_rate > 0.85
    print("PASS: TD errors trained both the critic and the explicit stochastic actor.")


if __name__ == "__main__":
    main()
