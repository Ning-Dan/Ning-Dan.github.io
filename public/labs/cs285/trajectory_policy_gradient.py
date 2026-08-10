#!/usr/bin/env python3
"""Trajectory REINFORCE with Gaussian actions and causal reward-to-go.

The finite-horizon objective discounts rewards from the trajectory start.  The
lab therefore uses absolute powers gamma**t, making the convention explicit.
"""

from __future__ import annotations

import numpy as np


GAMMA = 0.90
SIGMA = 0.45
TARGETS = np.array([0.8, -0.5, 0.25, 0.6])


def sample_estimators(
    rng: np.random.Generator, theta: np.ndarray, batch: int
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    actions = rng.normal(theta, SIGMA, size=(batch, len(theta)))
    rewards = 1.5 - (actions - TARGETS) ** 2 + rng.normal(0.0, 0.20, actions.shape)
    discounts = GAMMA ** np.arange(len(theta))
    discounted_rewards = rewards * discounts
    full_return = discounted_rewards.sum(axis=1, keepdims=True)
    absolute_reward_to_go = np.flip(
        np.cumsum(np.flip(discounted_rewards, axis=1), axis=1), axis=1
    )
    score = (actions - theta) / SIGMA**2
    full_gradient = score * full_return
    causal_gradient = score * absolute_reward_to_go
    return full_gradient, causal_gradient, rewards


def train() -> np.ndarray:
    rng = np.random.default_rng(19)
    theta = np.zeros_like(TARGETS)
    for _ in range(180):
        _, causal, _ = sample_estimators(rng, theta, batch=2048)
        theta += 0.055 * causal.mean(axis=0)
    return theta


def main() -> None:
    rng = np.random.default_rng(5)
    full, causal, _ = sample_estimators(rng, np.zeros_like(TARGETS), batch=250_000)
    mean_gap = float(np.max(np.abs(full.mean(axis=0) - causal.mean(axis=0))))
    full_variance = float(full.var(axis=0).mean())
    causal_variance = float(causal.var(axis=0).mean())

    learned = train()
    print(f"max estimator mean gap:          {mean_gap:.4f}")
    print(f"mean variance full / causal:     {full_variance:.3f} / {causal_variance:.3f}")
    print(f"target Gaussian means:           {TARGETS}")
    print(f"learned Gaussian means:          {np.round(learned, 3)}")

    assert mean_gap < 0.04
    assert causal_variance < 0.78 * full_variance
    assert np.max(np.abs(learned - TARGETS)) < 0.08
    print("PASS: causal reward-to-go preserved the mean, reduced variance, and trained the Gaussian means.")


if __name__ == "__main__":
    main()
