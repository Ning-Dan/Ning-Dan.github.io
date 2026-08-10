#!/usr/bin/env python3
"""Lab 2 对齐实验：二维 GMM 上的 CFM、score、ODE/SDE 与线性 bridge。"""

from __future__ import annotations

import math

import numpy as np


class RandomFeatureRegressor:
    """固定随机非线性特征，只拟合末层；用于 CPU 上的机制核对。"""

    def __init__(self, rng, inputs=3, frequencies=56, ridge=2e-3):
        self.projection = rng.normal(scale=1.2, size=(inputs, frequencies))
        self.phase = rng.uniform(0.0, 2.0 * math.pi, size=frequencies)
        self.ridge = ridge
        self.weights = None

    def features(self, x, t):
        t = np.asarray(t).reshape(-1, 1)
        raw = np.concatenate([x, t], axis=1)
        angles = raw @ self.projection + self.phase
        return np.concatenate(
            [np.ones((len(x), 1)), raw, raw**2, np.sin(angles), np.cos(angles)],
            axis=1,
        )

    def fit(self, x, t, target):
        phi = self.features(x, t)
        gram = phi.T @ phi / len(phi)
        rhs = phi.T @ target / len(phi)
        regularizer = self.ridge * np.eye(gram.shape[0])
        regularizer[0, 0] = 0.0
        self.weights = np.linalg.solve(gram + regularizer, rhs)

    def __call__(self, x, t):
        if np.isscalar(t):
            t = np.full(len(x), t)
        return self.features(x, t) @ self.weights


def sample_target(rng, n):
    labels = rng.integers(0, 2, size=n)
    centers = np.where(labels[:, None] == 0, np.array([-2.0, 0.0]), np.array([2.0, 0.0]))
    return centers + 0.35 * rng.normal(size=(n, 2))


def make_straight_path_batch(rng, n, t_low=0.03, t_high=0.90):
    x0 = rng.normal(size=(n, 2))
    z = sample_target(rng, n)
    t = rng.uniform(t_low, t_high, size=n)
    xt = (1.0 - t[:, None]) * x0 + t[:, None] * z
    velocity_target = z - x0
    score_target = -x0 / (1.0 - t[:, None])
    return x0, z, t, xt, velocity_target, score_target


def mse(a, b):
    return float(np.mean((a - b) ** 2))


def train_models(rng):
    _, _, t, xt, velocity_target, score_target = make_straight_path_batch(rng, 18_000)
    flow = RandomFeatureRegressor(rng)
    score = RandomFeatureRegressor(rng)
    flow.fit(xt, t, velocity_target)
    score.fit(xt, t, score_target)

    _, _, tv, xv, vv, sv = make_straight_path_batch(rng, 5_000)
    flow_zero = mse(np.zeros_like(vv), vv)
    score_zero = mse(np.zeros_like(sv), sv)
    flow_fit = mse(flow(xv, tv), vv)
    score_fit = mse(score(xv, tv), sv)
    assert flow_fit < 0.8 * flow_zero
    assert score_fit < 0.8 * score_zero
    return flow, score, (flow_zero, flow_fit, score_zero, score_fit)


def sample_ode(flow, rng, n=4_000, steps=120):
    x = rng.normal(size=(n, 2))
    initial = x.copy()
    h = 1.0 / steps
    for step in range(steps):
        t = (step + 0.5) * h
        x = x + h * flow(x, t)
    assert np.isfinite(x).all()
    initial_nearest = np.mean(np.minimum(abs(initial[:, 0] - 2.0), abs(initial[:, 0] + 2.0)))
    final_nearest = np.mean(np.minimum(abs(x[:, 0] - 2.0), abs(x[:, 0] + 2.0)))
    assert final_nearest < initial_nearest
    assert np.var(x[:, 0]) > np.var(initial[:, 0])
    return x, float(initial_nearest), float(final_nearest)


def sample_sde(flow, score, rng, n=2_000, steps=120, sigma=0.16):
    """u 与 score 构造同边缘 SDE：drift=u+sigma^2 score/2。"""
    x = rng.normal(size=(n, 2))
    h = 1.0 / steps
    for step in range(steps):
        t = (step + 0.5) * h
        # Score 回归只训练到 t=0.9；最后 10% 令 diffusion coefficient 为 0，
        # 于是合法地退化回 ODE，而不是把端点外推的 score 塞进 SDE。
        local_sigma = sigma if t <= 0.90 else 0.0
        correction = 0.5 * local_sigma**2 * score(x, t) if local_sigma else 0.0
        drift = flow(x, t) + correction
        x = x + h * drift + math.sqrt(h) * local_sigma * rng.normal(size=x.shape)
    assert np.isfinite(x).all()
    assert np.var(x[:, 0]) > 1.3
    return x


def check_arbitrary_source_bridge(rng):
    """线性 bridge 不要求 source 是高斯，只要求能抽样。"""
    source = rng.uniform(-1.0, 1.0, size=(128, 2))
    target = sample_target(rng, len(source))
    h = 1e-5

    def bridge(t):
        return (1.0 - t) * source + t * target

    velocity_fd = (bridge(0.4 + h) - bridge(0.4)) / h
    assert np.allclose(bridge(0.0), source)
    assert np.allclose(bridge(1.0), target)
    assert np.allclose(velocity_fd, target - source, atol=1e-8)


def main():
    rng = np.random.default_rng(7)
    flow, score, losses = train_models(rng)
    _, initial_distance, final_distance = sample_ode(flow, rng)
    sde_samples = sample_sde(flow, score, rng)
    check_arbitrary_source_bridge(rng)

    f0, f1, s0, s1 = losses
    print(f"CFM validation MSE: {f0:.4f} -> {f1:.4f}")
    print(f"Score validation MSE: {s0:.4f} -> {s1:.4f}")
    print(f"ODE nearest-mode distance: {initial_distance:.4f} -> {final_distance:.4f}")
    print(f"SDE sample variance: x={np.var(sde_samples[:, 0]):.4f}, y={np.var(sde_samples[:, 1]):.4f}")
    print("PASS: Lab 2 GMM CFM/score/ODE/SDE/linear bridge")


if __name__ == "__main__":
    main()
