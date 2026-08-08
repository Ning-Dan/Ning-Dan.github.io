"""Tiny language-conditioned behavior cloning without ML dependencies.

Run: python3 toy_behavior_cloning.py
The two features stand in for a visual target coordinate and a language token.
"""

from __future__ import annotations

import random


def make_data(seed: int = 7) -> list[tuple[float, float, float]]:
    rng = random.Random(seed)
    rows = []
    for _ in range(64):
        visual = rng.uniform(-1.0, 1.0)
        language = rng.choice((-1.0, 1.0))
        action = 0.7 * visual + 0.9 * language + 0.15
        rows.append((visual, language, action))
    return rows


def mse(weights: list[float], rows: list[tuple[float, float, float]]) -> float:
    total = 0.0
    for visual, language, target in rows:
        prediction = weights[0] * visual + weights[1] * language + weights[2]
        total += (prediction - target) ** 2
    return total / len(rows)


def train(rows: list[tuple[float, float, float]], steps: int = 500, lr: float = 0.08) -> list[float]:
    weights = [0.0, 0.0, 0.0]
    for _ in range(steps):
        gradient = [0.0, 0.0, 0.0]
        for visual, language, target in rows:
            error = weights[0] * visual + weights[1] * language + weights[2] - target
            gradient[0] += 2.0 * error * visual / len(rows)
            gradient[1] += 2.0 * error * language / len(rows)
            gradient[2] += 2.0 * error / len(rows)
        weights = [weight - lr * grad for weight, grad in zip(weights, gradient)]
    return weights


def smoke_test() -> None:
    rows = make_data()
    initial = mse([0.0, 0.0, 0.0], rows)
    weights = train(rows)
    trained = mse(weights, rows)
    shuffled = [(visual, -language, target) for visual, language, target in rows]
    shuffled_loss = mse(weights, shuffled)
    assert trained < initial * 0.01, (initial, trained)
    assert shuffled_loss > trained + 1.0, shuffled_loss
    assert max(abs(w - expected) for w, expected in zip(weights, (0.7, 0.9, 0.15))) < 1e-6
    print("weights:", [round(weight, 4) for weight in weights])
    print(f"loss: {initial:.4f} -> {trained:.8f}; shuffled language: {shuffled_loss:.4f}")
    print("toy BC smoke test: PASS")


if __name__ == "__main__":
    smoke_test()
