#!/usr/bin/env python3
"""高斯 score 与 classifier-free guidance 的最小数值实验。"""


def gaussian_score(x: float, mean: float, std: float) -> float:
    return -(x - mean) / (std * std)


def cfg(unconditional: float, conditional: float, weight: float) -> float:
    """(1-w) u_empty + w u_cond，等价于 u_empty + w(u_cond-u_empty)。"""
    return (1.0 - weight) * unconditional + weight * conditional


def main() -> None:
    # log N(mean, std^2) 的有限差分梯度应等于解析 score。
    x, mean, std, h = 1.2, 0.5, 0.8, 1e-6

    def log_density(value: float) -> float:
        return -0.5 * ((value - mean) / std) ** 2

    numeric = (log_density(x + h) - log_density(x - h)) / (2.0 * h)
    analytic = gaussian_score(x, mean, std)
    assert abs(numeric - analytic) < 1e-8
    assert analytic < 0.0  # x 位于均值右侧，score 指回高密度区。

    unconditional, conditional = -0.25, 0.75
    assert cfg(unconditional, conditional, 1.0) == conditional
    assert cfg(unconditional, conditional, 3.0) == 2.75
    assert cfg(unconditional, conditional, 3.0) - conditional == 2.0

    print(f"Gaussian score: numeric={numeric:.6f}, analytic={analytic:.6f}")
    print("CFG: w=1 -> 0.75; w=3 -> 2.75 (extrapolation beyond conditional field)")
    print("PASS: score points uphill and CFG amplifies the conditional-minus-empty direction")


if __name__ == "__main__":
    main()
