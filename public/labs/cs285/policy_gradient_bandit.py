#!/usr/bin/env python3
"""REINFORCE and baseline variance on a two-action bandit.

Original miniature experiment corresponding to CS285 Lectures 5-6 / HW2.
"""

from __future__ import annotations

import numpy as np


def sigmoid(value: float) -> float:
    return float(1.0 / (1.0 + np.exp(-value)))


def sample_gradients(
    rng: np.random.Generator, theta: float, count: int, baseline: float
) -> tuple[np.ndarray, np.ndarray]:
    probability = sigmoid(theta)
    actions = (rng.random(count) < probability).astype(float)
    # Action 1 is better by 2, while a large common offset creates variance
    # that a baseline can remove. Noise represents stochastic reward.
    rewards = 10.0 + 2.0 * actions + rng.normal(0.0, 0.7, size=count)
    score = actions - probability  # d log Bernoulli(a; p(theta)) / d theta
    raw = score * rewards
    centered = score * (rewards - baseline)
    return raw, centered


def main() -> None:
    rng = np.random.default_rng(7)
    raw, centered = sample_gradients(rng, theta=0.0, count=200_000, baseline=11.0)

    print(f"raw gradient mean/var:      {raw.mean():.4f} / {raw.var():.4f}")
    print(f"baseline gradient mean/var: {centered.mean():.4f} / {centered.var():.4f}")

    # Both estimate the same gradient. The baseline removes the irrelevant
    # common reward offset, so its variance should be dramatically smaller.
    assert abs(raw.mean() - centered.mean()) < 0.04
    assert centered.var() < 0.05 * raw.var()

    theta = 0.0
    for _ in range(100):
        _, batch_grad = sample_gradients(rng, theta, count=512, baseline=11.0)
        theta += 0.20 * float(batch_grad.mean())

    learned_probability = sigmoid(theta)
    print(f"P(better action) after updates: {learned_probability:.4f}")
    assert learned_probability > 0.93
    print("PASS: the baseline preserved the gradient mean, reduced variance, and learning favored the better arm.")


if __name__ == "__main__":
    main()
