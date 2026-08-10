#!/usr/bin/env python3
"""Random-shooting/CEM MPC with an ensemble and on-policy aggregation.

This is an original one-dimensional experiment inspired by CS285 HW4.  It
does not copy the homework implementation or expose a homework solution.
"""

from __future__ import annotations

import numpy as np


TRUE_GAIN = 0.92
TRUE_BIAS = 0.06
TARGET = 1.20
ACTION_LIMIT = 0.30


def real_step(state: float, action: float, rng: np.random.Generator) -> float:
    return state + TRUE_GAIN * action + TRUE_BIAS + float(rng.normal(0.0, 0.004))


def initial_dataset(rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """A deliberately shifted source-system dataset."""
    states = rng.uniform(-0.6, 0.6, size=72)
    actions = rng.uniform(-ACTION_LIMIT, ACTION_LIMIT, size=72)
    deltas = 0.82 * actions - 0.015 + rng.normal(0.0, 0.012, size=72)
    return states, actions, states + deltas


def fit_ensemble(
    data: tuple[np.ndarray, np.ndarray, np.ndarray],
    rng: np.random.Generator,
    members: int = 7,
) -> np.ndarray:
    states, actions, next_states = data
    design = np.column_stack([actions, np.ones_like(actions)])
    delta = next_states - states
    models = []
    for _ in range(members):
        indices = rng.integers(0, len(states), size=len(states))
        parameter, *_ = np.linalg.lstsq(design[indices], delta[indices], rcond=None)
        models.append(parameter)  # [action gain, bias]
    return np.asarray(models)


def score_sequences(state: float, sequences: np.ndarray, models: np.ndarray) -> np.ndarray:
    """Risk-neutral ensemble score; all candidates share the same model particles."""
    scores = np.zeros(len(sequences))
    for gain, bias in models:
        predicted = np.full(len(sequences), state)
        returns = np.zeros(len(sequences))
        for step in range(sequences.shape[1]):
            action = sequences[:, step]
            predicted = predicted + gain * action + bias
            returns -= (predicted - TARGET) ** 2 + 0.015 * action**2
        scores += returns / len(models)
    return scores


def random_shooting(
    state: float,
    models: np.ndarray,
    horizon: int,
    rng: np.random.Generator,
    candidates: int = 1200,
) -> np.ndarray:
    sequences = rng.uniform(-ACTION_LIMIT, ACTION_LIMIT, size=(candidates, horizon))
    return sequences[int(np.argmax(score_sequences(state, sequences, models)))]


def cem(
    state: float,
    models: np.ndarray,
    horizon: int,
    rng: np.random.Generator,
    candidates: int = 600,
    iterations: int = 4,
) -> np.ndarray:
    mean = np.zeros(horizon)
    std = np.full(horizon, ACTION_LIMIT)
    best = mean.copy()
    for _ in range(iterations):
        sequences = np.clip(
            rng.normal(mean, std, size=(candidates, horizon)),
            -ACTION_LIMIT,
            ACTION_LIMIT,
        )
        scores = score_sequences(state, sequences, models)
        elite = sequences[np.argsort(scores)[-max(24, candidates // 10) :]]
        mean = elite.mean(axis=0)
        std = np.maximum(elite.std(axis=0), 0.025)
        best = sequences[int(np.argmax(scores))]
    return best


def rollout(
    models: np.ndarray,
    seed: int,
    start: float,
    steps: int = 9,
    collect: bool = False,
) -> tuple[float, tuple[np.ndarray, np.ndarray, np.ndarray] | None]:
    rng = np.random.default_rng(seed)
    state = start
    transitions: list[tuple[float, float, float]] = []
    for step in range(steps):
        horizon = min(5, steps - step)
        # Alternate the two genuine sampling planners so both code paths run.
        sequence = (
            random_shooting(state, models, horizon, rng)
            if step % 2 == 0
            else cem(state, models, horizon, rng)
        )
        action = float(sequence[0])
        next_state = real_step(state, action, rng)
        transitions.append((state, action, next_state))
        state = next_state
    if not collect:
        return state, None
    array = np.asarray(transitions)
    return state, (array[:, 0], array[:, 1], array[:, 2])


def concatenate(
    left: tuple[np.ndarray, np.ndarray, np.ndarray],
    right: tuple[np.ndarray, np.ndarray, np.ndarray],
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    return tuple(np.concatenate([a, b]) for a, b in zip(left, right))  # type: ignore[return-value]


def evaluate(models: np.ndarray, seed_offset: int) -> float:
    errors = []
    for index, start in enumerate((-0.45, -0.15, 0.15, 0.45)):
        final, _ = rollout(models, seed_offset + index, start)
        errors.append(abs(final - TARGET))
    return float(np.mean(errors))


def main() -> None:
    fit_rng = np.random.default_rng(3)
    data = initial_dataset(fit_rng)
    initial_models = fit_ensemble(data, fit_rng)
    before_error = evaluate(initial_models, 100)

    models = initial_models
    for round_index in range(4):
        for start_index, start in enumerate((-0.55, 0.0, 0.55)):
            _, new_data = rollout(
                models,
                seed=1000 + 20 * round_index + start_index,
                start=start,
                collect=True,
            )
            assert new_data is not None
            data = concatenate(data, new_data)
        models = fit_ensemble(data, fit_rng)

    after_error = evaluate(models, 200)
    print(f"initial ensemble gain/bias:    {initial_models[:, 0].mean():.3f} / {initial_models[:, 1].mean():.3f}")
    print(f"aggregated ensemble gain/bias: {models[:, 0].mean():.3f} / {models[:, 1].mean():.3f}")
    print(f"mean MPC error before/after:   {before_error:.4f} / {after_error:.4f}")

    assert abs(models[:, 0].mean() - TRUE_GAIN) < abs(initial_models[:, 0].mean() - TRUE_GAIN)
    assert abs(models[:, 1].mean() - TRUE_BIAS) < abs(initial_models[:, 1].mean() - TRUE_BIAS)
    assert after_error < before_error
    assert after_error < 0.08
    print("PASS: sampled planning ran, and on-policy data moved the ensemble toward the deployment dynamics.")


if __name__ == "__main__":
    main()
