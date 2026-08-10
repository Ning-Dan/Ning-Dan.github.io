#!/usr/bin/env python3
"""KDE and an EX2-style exemplar classifier for continuous novelty.

This small synthetic test studies the scoring idea only.  It is independent of
the CS285 HW5 starter code and is not a homework solution.
"""

from __future__ import annotations

import numpy as np


def kde_density(query: float, replay: np.ndarray, bandwidth: float) -> float:
    scaled = (query - replay) / bandwidth
    kernels = np.exp(-0.5 * scaled**2) / np.sqrt(2.0 * np.pi)
    return float(kernels.mean() / bandwidth)


def features(values: np.ndarray) -> np.ndarray:
    return np.column_stack([np.ones(len(values)), values, values**2])


def exemplar_probability(query: float, replay: np.ndarray, seed: int) -> float:
    """Train a tiny balanced classifier: query augmentations vs replay."""
    rng = np.random.default_rng(seed)
    positives = query + rng.normal(0.0, 0.06, size=96)
    negatives = rng.choice(replay, size=192, replace=True)
    values = np.concatenate([positives, negatives])
    labels = np.concatenate([np.ones(len(positives)), np.zeros(len(negatives))])
    design = features(values)
    weights = np.zeros(design.shape[1])
    for _ in range(700):
        logits = np.clip(design @ weights, -30.0, 30.0)
        probabilities = 1.0 / (1.0 + np.exp(-logits))
        gradient = design.T @ (probabilities - labels) / len(labels)
        weights -= 0.16 * gradient
    query_logit = float((features(np.array([query])) @ weights)[0])
    return float(1.0 / (1.0 + np.exp(-np.clip(query_logit, -30.0, 30.0))))


def main() -> None:
    rng = np.random.default_rng(29)
    replay = rng.normal(0.0, 0.35, size=500)
    familiar, novel = 0.10, 2.20

    kde_familiar = kde_density(familiar, replay, bandwidth=0.25)
    kde_novel = kde_density(novel, replay, bandwidth=0.25)
    ex2_familiar = exemplar_probability(familiar, replay, seed=1)
    ex2_novel = exemplar_probability(novel, replay, seed=2)

    print(f"KDE density familiar / novel:       {kde_familiar:.5f} / {kde_novel:.5f}")
    print(f"exemplar P(positive) familiar/novel:{ex2_familiar:.3f} / {ex2_novel:.3f}")
    assert kde_novel < 0.01 * kde_familiar
    assert ex2_novel > ex2_familiar + 0.35
    assert ex2_novel > 0.80
    print("PASS: both density and exemplar views assigned greater novelty to the outlier.")


if __name__ == "__main__":
    main()
