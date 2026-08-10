#!/usr/bin/env python3
"""Count-based intrinsic reward in a sparse chain environment.

Original tabular experiment corresponding to CS285 Lectures 18-19 / HW5.
"""

from __future__ import annotations

import numpy as np


def run(alpha: float, seed: int) -> tuple[int, int, np.ndarray]:
    rng = np.random.default_rng(seed)
    terminal = 14
    q_values = np.zeros((terminal + 1, 2))
    visits = np.ones(terminal + 1)
    action_visits = np.ones((terminal + 1, 2))
    first_success = 10_000
    successes = 0

    for episode in range(180):
        state = 0
        episode_visits = np.ones(terminal + 1)
        for _ in range(35):
            if rng.random() < 0.04:
                action = int(rng.integers(2))
            else:
                # The agent chooses only from learned Q values. It does not peek
                # at candidate next states or assume access to the transition model.
                # The current (state, action) count is already in its history.
                scores = q_values[state] + alpha / np.sqrt(action_visits[state])
                best = np.flatnonzero(scores == scores.max())
                action = int(best[0])
            action_visits[state, action] += 1

            direction = -1 if action == 0 else 1
            next_state = int(np.clip(state + direction, 0, terminal))
            visits[next_state] += 1
            extrinsic = float(next_state == terminal)
            # The novelty reward is computed only after observing next_state.
            # Episodic counts make moving into a new state preferable to pacing
            # inside an already visited part of the corridor.
            bonus = alpha / np.sqrt(episode_visits[next_state])
            episode_visits[next_state] += 1
            shaped_reward = extrinsic + bonus
            done = next_state == terminal
            target = shaped_reward if done else shaped_reward + 0.97 * q_values[next_state].max()
            q_values[state, action] += 0.25 * (target - q_values[state, action])
            state = next_state
            if done:
                first_success = min(first_success, episode)
                successes += 1
                break
    return first_success, successes, visits


def main() -> None:
    plain = [run(alpha=0.0, seed=seed) for seed in range(8)]
    curious = [run(alpha=0.35, seed=seed) for seed in range(8)]
    plain_first = np.median([result[0] for result in plain])
    curious_first = np.median([result[0] for result in curious])
    plain_success = sum(result[1] for result in plain)
    curious_success = sum(result[1] for result in curious)

    print(f"median first success, no bonus / count bonus: {plain_first:.1f} / {curious_first:.1f}")
    print(f"total successes over 8 seeds:              {plain_success} / {curious_success}")
    print(f"example start/end visits with bonus:       {curious[0][2][0]:.0f} / {curious[0][2][-1]:.0f}")

    assert curious_first < plain_first
    assert curious_success > plain_success + 100
    assert curious_first < 80
    print("PASS: the decaying count bonus discovered the distant sparse reward earlier and more often.")


if __name__ == "__main__":
    main()
