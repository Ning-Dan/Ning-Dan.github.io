#!/usr/bin/env python3
"""Replay Q-learning with a delayed target table on a small chain MDP.

This isolates the mechanisms taught in CS285 Lectures 7-8 / HW3 without
copying the course's Atari implementation.
"""

from __future__ import annotations

from collections import deque

import numpy as np


def transition(state: int, action: int, terminal: int) -> tuple[int, float, bool]:
    direction = -1 if action == 0 else 1
    next_state = int(np.clip(state + direction, 0, terminal))
    done = next_state == terminal
    return next_state, float(done), done


def train() -> np.ndarray:
    rng = np.random.default_rng(4)
    terminal = 6
    online = np.zeros((terminal + 1, 2))
    target = online.copy()
    replay: deque[tuple[int, int, float, int, bool]] = deque(maxlen=500)
    updates = 0

    for episode in range(350):
        state = 0
        for _ in range(20):
            if rng.random() < 0.25:
                action = int(rng.integers(2))
            else:
                # Random tie breaking prevents a fixed bias before values arrive.
                best = np.flatnonzero(online[state] == online[state].max())
                action = int(rng.choice(best))
            next_state, reward, done = transition(state, action, terminal)
            replay.append((state, action, reward, next_state, done))
            state = next_state

            if len(replay) >= 32:
                indices = rng.integers(0, len(replay), size=32)
                for index in indices:
                    s, a, r, s_next, terminal_flag = replay[int(index)]
                    y = r if terminal_flag else r + 0.95 * float(target[s_next].max())
                    online[s, a] += 0.12 * (y - online[s, a])
                    updates += 1
                    if updates % 160 == 0:
                        target[:] = online
            if done:
                break
    return online


def train_double() -> tuple[np.ndarray, int]:
    """Actual Double-Q learning: one table selects, the other evaluates."""
    rng = np.random.default_rng(11)
    terminal = 6
    left = np.zeros((terminal + 1, 2))
    right = np.zeros_like(left)
    updates = 0

    for episode in range(500):
        state = 0
        for _ in range(24):
            combined = left[state] + right[state]
            if rng.random() < 0.20:
                action = int(rng.integers(2))
            else:
                best = np.flatnonzero(combined == combined.max())
                action = int(rng.choice(best))
            next_state, reward, done = transition(state, action, terminal)

            if rng.random() < 0.5:
                selected = int(np.argmax(left[next_state]))
                bootstrap = 0.0 if done else right[next_state, selected]
                target_value = reward + 0.95 * bootstrap
                left[state, action] += 0.15 * (target_value - left[state, action])
            else:
                selected = int(np.argmax(right[next_state]))
                bootstrap = 0.0 if done else left[next_state, selected]
                target_value = reward + 0.95 * bootstrap
                right[state, action] += 0.15 * (target_value - right[state, action])
            updates += 1
            state = next_state
            if done:
                break
    return 0.5 * (left + right), updates


def main() -> None:
    q_values = train()
    double_values, double_updates = train_double()
    np.set_printoptions(precision=3, suppress=True)
    print("learned Q table (left, right):")
    print(q_values[:-1])

    assert q_values[0, 1] > 0.70
    assert q_values[0, 1] > q_values[0, 0]
    assert all(q_values[state, 1] >= q_values[state, 0] for state in range(6))

    print("learned Double-Q average table (left, right):")
    print(double_values[:-1])
    assert double_updates > 1_000
    assert double_values[0, 1] > double_values[0, 0]
    assert all(double_values[state, 1] >= double_values[state, 0] for state in range(6))

    # The online table selects action 0 due to a positive estimation error.
    # A shared max over target estimates would select action 1 instead.
    online_next = np.array([5.0, 4.0])
    target_next = np.array([2.0, 3.0])
    shared_max_target = 0.9 * float(target_next.max())
    double_target = 0.9 * float(target_next[np.argmax(online_next)])
    print(f"shared-max target: {shared_max_target:.2f}")
    print(f"Double-Q target:   {double_target:.2f}")
    assert double_target < shared_max_target
    print("PASS: replay propagated value, and trained Double-Q tables separated selection from evaluation.")


if __name__ == "__main__":
    main()
