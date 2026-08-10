#!/usr/bin/env python3
"""直线 CondOT 路径：验证采样公式、速度目标和边界分布。"""

from random import Random
from statistics import fmean, pvariance


def path_sample(z: float, epsilon: float, t: float) -> float:
    """x_t = t z + (1-t) epsilon。"""
    return t * z + (1.0 - t) * epsilon


def conditional_velocity(z: float, epsilon: float) -> float:
    """对 t 求导得到 u_t(x|z) = z - epsilon。"""
    return z - epsilon


def finite_difference(z: float, epsilon: float, t: float, h: float) -> float:
    return (path_sample(z, epsilon, t + h) - path_sample(z, epsilon, t)) / h


def main() -> None:
    z, epsilon = 3.0, -1.0
    assert path_sample(z, epsilon, 0.0) == epsilon
    assert path_sample(z, epsilon, 1.0) == z
    assert abs(finite_difference(z, epsilon, 0.37, 1e-6) - conditional_velocity(z, epsilon)) < 1e-8

    rng = Random(6975)
    # 玩具数据分布：等概率选择 -2 或 +2；初始分布是 N(0,1)。
    pairs = [
        ((-2.0 if rng.random() < 0.5 else 2.0), rng.gauss(0.0, 1.0))
        for _ in range(30_000)
    ]
    x0 = [path_sample(z_i, e_i, 0.0) for z_i, e_i in pairs]
    x1 = [path_sample(z_i, e_i, 1.0) for z_i, e_i in pairs]
    assert abs(fmean(x0)) < 0.03
    assert abs(pvariance(x0) - 1.0) < 0.04
    assert abs(fmean(x1)) < 0.03
    assert abs(pvariance(x1) - 4.0) < 0.03

    print("single path: x(0)=-1, x(1)=3, velocity=4")
    print(f"marginal var: t=0 -> {pvariance(x0):.3f}, t=1 -> {pvariance(x1):.3f}")
    print("PASS: the CondOT path joins noise to data and its target is the path derivative")


if __name__ == "__main__":
    main()
