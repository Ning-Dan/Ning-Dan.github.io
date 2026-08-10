#!/usr/bin/env python3
"""两状态 CTMC：率矩阵、Kolmogorov 前向方程与小步转移概率。"""

from math import exp


def euler_probabilities(rate_ab: float, rate_ba: float, step: float, steps: int) -> tuple[float, float]:
    p_a, p_b = 1.0, 0.0
    for _ in range(steps):
        # dp_B/dt = rate_ab p_A - rate_ba p_B；dp_A = -dp_B。
        delta_b = step * (rate_ab * p_a - rate_ba * p_b)
        p_a -= delta_b
        p_b += delta_b
        assert -1e-12 <= p_a <= 1.0 + 1e-12
        assert -1e-12 <= p_b <= 1.0 + 1e-12
        assert abs(p_a + p_b - 1.0) < 1e-12
    return p_a, p_b


def main() -> None:
    rate_ab, rate_ba, duration = 2.0, 1.0, 1.0
    p_a, p_b = euler_probabilities(rate_ab, rate_ba, step=0.0005, steps=2000)

    stationary_b = rate_ab / (rate_ab + rate_ba)
    exact_b = stationary_b * (1.0 - exp(-(rate_ab + rate_ba) * duration))
    assert abs(p_b - exact_b) < 0.001
    assert abs(sum((p_a, p_b)) - 1.0) < 1e-12

    # 单个小步中，A 跳到 B 的概率约为 h * Q(B|A)，必须不超过 1。
    h = 0.01
    jump_probability = h * rate_ab
    assert 0.0 <= jump_probability <= 1.0

    print(f"P(B, t=1): Euler={p_b:.6f}, exact={exact_b:.6f}")
    print(f"one-step A->B probability at h={h}: {jump_probability:.3f}")
    print("PASS: the rate matrix conserves probability and Euler follows the KFE")


if __name__ == "__main__":
    main()
