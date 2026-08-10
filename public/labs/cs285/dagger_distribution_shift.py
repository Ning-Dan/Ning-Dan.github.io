#!/usr/bin/env python3
"""A tiny closed-loop imitation-learning example inspired by CS285 HW1.

This is an original tabular regression exercise, not a homework solution.
It needs only NumPy and runs on CPU.
"""

from __future__ import annotations

import numpy as np


BINS = np.linspace(-1.0, 1.0, 41)


def expert(state: float) -> float:
    """A stabilizing expert for x[t+1] = 1.12 x[t] + a[t]."""

    return float(np.clip(-0.50 * state, -0.6, 0.6))


def bin_index(state: float) -> int:
    return int(np.argmin(np.abs(BINS - np.clip(state, -1.0, 1.0))))


def fit_policy(states: np.ndarray, actions: np.ndarray) -> np.ndarray:
    """Fit a lookup table and extend unseen cells from the nearest seen cell."""

    sums = np.zeros(len(BINS))
    counts = np.zeros(len(BINS), dtype=int)
    for state, action in zip(states, actions):
        idx = bin_index(float(state))
        sums[idx] += action
        counts[idx] += 1

    table = np.zeros(len(BINS))
    seen = np.flatnonzero(counts)
    table[seen] = sums[seen] / counts[seen]
    for idx in np.flatnonzero(counts == 0):
        nearest = seen[np.argmin(np.abs(seen - idx))]
        table[idx] = table[nearest]
    return table


def rollout(table: np.ndarray, initial: float, horizon: int = 18) -> np.ndarray:
    states = [float(initial)]
    for _ in range(horizon):
        state = states[-1]
        action = float(table[bin_index(state)])
        states.append(float(np.clip(1.12 * state + action, -1.0, 1.0)))
    return np.asarray(states)


def mean_final_error(table: np.ndarray) -> float:
    starts = np.linspace(-0.9, 0.9, 19)
    return float(np.mean([abs(rollout(table, start)[-1]) for start in starts]))


def main() -> None:
    # BC sees only the narrow expert occupancy around the origin.
    states = np.linspace(-0.20, 0.20, 25)
    actions = np.asarray([expert(x) for x in states])
    bc_table = fit_policy(states, actions)
    bc_error = mean_final_error(bc_table)

    # DAgger deliberately starts the current policy from perturbed states and
    # asks the expert what should have been done at every visited state.
    dagger_table = bc_table.copy()
    agg_states = list(states)
    agg_actions = list(actions)
    for _ in range(5):
        for start in np.linspace(-0.9, 0.9, 13):
            visited = rollout(dagger_table, float(start), horizon=12)[:-1]
            agg_states.extend(visited.tolist())
            agg_actions.extend(expert(float(x)) for x in visited)
        dagger_table = fit_policy(np.asarray(agg_states), np.asarray(agg_actions))

    dagger_error = mean_final_error(dagger_table)

    print(f"BC mean final |x|:      {bc_error:.4f}")
    print(f"DAgger mean final |x|:  {dagger_error:.4f}")
    print(f"aggregated samples:     {len(agg_states)}")

    assert bc_error > 0.20, "The BC setup should expose off-distribution failure."
    assert dagger_error < 0.03, "DAgger should learn recovery actions."
    assert dagger_error < 0.15 * bc_error
    print("PASS: querying the expert on learner-visited states repaired closed-loop drift.")


if __name__ == "__main__":
    main()
