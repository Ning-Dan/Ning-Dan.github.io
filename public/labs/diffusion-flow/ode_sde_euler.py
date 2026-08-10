#!/usr/bin/env python3
"""MIT 6.S184 Lecture/Lab 1 的标准库缩小版：Euler 与 Euler--Maruyama。"""

from math import exp
from random import Random
from statistics import fmean, pvariance


def euler_decay(x0: float, theta: float, step: float, steps: int) -> float:
    """用 Euler 法积分 dX/dt = -theta * X。"""
    x = x0
    for _ in range(steps):
        x += step * (-theta * x)
    return x


def brownian_terminal_samples(
    *, sigma: float, step: float, steps: int, samples: int, seed: int
) -> list[float]:
    """Euler--Maruyama 模拟 dX = sigma dW，返回终点样本。"""
    rng = Random(seed)
    terminals: list[float] = []
    noise_scale = sigma * step**0.5
    for _ in range(samples):
        x = 0.0
        for _ in range(steps):
            x += noise_scale * rng.gauss(0.0, 1.0)
        terminals.append(x)
    return terminals


def main() -> None:
    x_euler = euler_decay(x0=2.0, theta=0.5, step=0.01, steps=100)
    x_exact = 2.0 * exp(-0.5)
    assert abs(x_euler - x_exact) < 0.01

    samples = brownian_terminal_samples(
        sigma=1.5, step=0.01, steps=100, samples=20_000, seed=184
    )
    empirical_mean = fmean(samples)
    empirical_variance = pvariance(samples)
    theoretical_variance = 1.5**2 * 1.0
    assert abs(empirical_mean) < 0.04
    assert abs(empirical_variance - theoretical_variance) < 0.09

    print(f"Euler endpoint={x_euler:.6f}, exact={x_exact:.6f}")
    print(
        "Brownian mean="
        f"{empirical_mean:.4f}, variance={empirical_variance:.4f}, "
        f"theory={theoretical_variance:.4f}"
    )
    print("PASS: Euler drift and sqrt(dt)-scaled stochastic increments are consistent")


if __name__ == "__main__":
    main()
