#!/usr/bin/env python3
"""Lab 1 对齐实验：Euler、Brownian、OU 与 Langevin。"""

from __future__ import annotations

import math

import numpy as np


def euler(drift, x0, t0, t1, steps):
    """用显式 Euler 模拟 dx/dt=drift(t,x)。"""
    h = (t1 - t0) / steps
    x = np.array(x0, dtype=float, copy=True)
    t = t0
    for _ in range(steps):
        x = x + h * drift(t, x)
        t += h
    return x


def euler_maruyama(drift, diffusion, x0, t0, t1, steps, rng):
    """用 Euler--Maruyama 模拟 dX=u(t,X)dt+sigma(t,X)dW。"""
    h = (t1 - t0) / steps
    x = np.array(x0, dtype=float, copy=True)
    t = t0
    for _ in range(steps):
        noise = rng.normal(size=x.shape)
        x = x + h * drift(t, x) + math.sqrt(h) * diffusion(t, x) * noise
        t += h
    return x


def check_euler():
    rate = -0.7
    numeric = float(euler(lambda _t, x: rate * x, 2.0, 0.0, 1.0, 400))
    exact = 2.0 * math.exp(rate)
    error = abs(numeric - exact)
    assert error < 0.002
    return numeric, exact, error


def check_brownian(rng):
    paths = 30_000
    sigma = 1.3
    horizon = 1.2
    terminal = euler_maruyama(
        lambda _t, x: np.zeros_like(x),
        lambda _t, x: np.full_like(x, sigma),
        np.zeros(paths),
        0.0,
        horizon,
        240,
        rng,
    )
    empirical_mean = float(terminal.mean())
    empirical_var = float(terminal.var())
    expected_var = sigma**2 * horizon
    assert abs(empirical_mean) < 0.03
    assert abs(empirical_var - expected_var) < 0.06
    return empirical_mean, empirical_var, expected_var


def check_ou(rng):
    paths = 30_000
    theta, sigma, horizon, x0 = 1.1, 0.8, 1.7, 2.0
    terminal = euler_maruyama(
        lambda _t, x: -theta * x,
        lambda _t, x: np.full_like(x, sigma),
        np.full(paths, x0),
        0.0,
        horizon,
        340,
        rng,
    )
    exact_mean = x0 * math.exp(-theta * horizon)
    exact_var = sigma**2 / (2.0 * theta) * (1.0 - math.exp(-2.0 * theta * horizon))
    empirical_mean = float(terminal.mean())
    empirical_var = float(terminal.var())
    assert abs(empirical_mean - exact_mean) < 0.025
    assert abs(empirical_var - exact_var) < 0.025
    return empirical_mean, exact_mean, empirical_var, exact_var


def check_langevin(rng):
    """让 Langevin dynamics 从偏置初值靠近一个已知高斯目标。"""
    paths = 24_000
    target_mean, target_std = 1.5, 0.7
    noise_scale = 1.0

    def score(x):
        return -(x - target_mean) / target_std**2

    initial = rng.normal(-2.5, 1.0, size=paths)
    terminal = euler_maruyama(
        lambda _t, x: 0.5 * noise_scale**2 * score(x),
        lambda _t, x: np.full_like(x, noise_scale),
        initial,
        0.0,
        5.0,
        1_000,
        rng,
    )
    mean_error_before = abs(float(initial.mean()) - target_mean)
    mean_error_after = abs(float(terminal.mean()) - target_mean)
    variance_after = float(terminal.var())
    assert mean_error_after < 0.04
    assert mean_error_after < mean_error_before / 20.0
    assert abs(variance_after - target_std**2) < 0.035

    # 对 N(0,tau^2) 做 Langevin 时，drift 正是一个 OU drift。
    theta = 0.9
    tau2 = noise_scale**2 / (2.0 * theta)
    probes = np.array([-2.0, -0.3, 1.7])
    langevin_drift = 0.5 * noise_scale**2 * (-probes / tau2)
    ou_drift = -theta * probes
    assert np.allclose(langevin_drift, ou_drift)
    return mean_error_before, mean_error_after, variance_after, target_std**2


def main():
    rng = np.random.default_rng(2026)
    numeric, exact, error = check_euler()
    brown_mean, brown_var, brown_expected = check_brownian(rng)
    ou_mean, ou_exact_mean, ou_var, ou_exact_var = check_ou(rng)
    before, after, langevin_var, target_var = check_langevin(rng)

    print(f"Euler: numeric={numeric:.6f}, exact={exact:.6f}, error={error:.2e}")
    print(f"Brownian: mean={brown_mean:.4f}, var={brown_var:.4f}, theory={brown_expected:.4f}")
    print(
        "OU: "
        f"mean={ou_mean:.4f}/{ou_exact_mean:.4f}, "
        f"var={ou_var:.4f}/{ou_exact_var:.4f}"
    )
    print(
        "Langevin: "
        f"mean error {before:.4f} -> {after:.4f}, "
        f"var={langevin_var:.4f}/{target_var:.4f}"
    )
    print("PASS: Lab 1 ODE/SDE/Brownian/OU/Langevin")


if __name__ == "__main__":
    main()
