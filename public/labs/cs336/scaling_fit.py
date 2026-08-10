"""独立教学实验：标准库拟合 log y = intercept + slope log C。"""

import math
import random


def fit_power(compute: list[float], reducible_loss: list[float]) -> tuple[float, float]:
    xs = [math.log(x) for x in compute]
    ys = [math.log(y) for y in reducible_loss]
    xbar, ybar = sum(xs) / len(xs), sum(ys) / len(ys)
    slope = sum((x - xbar) * (y - ybar) for x, y in zip(xs, ys)) / sum(
        (x - xbar) ** 2 for x in xs
    )
    intercept = ybar - slope * xbar
    return math.exp(intercept), -slope


def relative_error(pred: float, actual: float) -> float:
    return abs(pred - actual) / actual


def predict_power(a: float, alpha: float, compute: float) -> float:
    return a * compute ** (-alpha)


def fit_and_evaluate(
    compute: list[float], loss: list[float], held_out_indices: set[int]
) -> tuple[float, float, float]:
    assert held_out_indices and len(held_out_indices) < len(compute)
    train_compute = [value for i, value in enumerate(compute) if i not in held_out_indices]
    train_loss = [value for i, value in enumerate(loss) if i not in held_out_indices]
    a, alpha = fit_power(train_compute, train_loss)
    errors = [
        relative_error(predict_power(a, alpha, compute[i]), loss[i])
        for i in sorted(held_out_indices)
    ]
    return a, alpha, sum(errors) / len(errors)


def main() -> None:
    compute = [1.0, 2.0, 4.0, 8.0, 16.0, 32.0, 64.0]
    true_a, true_alpha = 0.8, 0.3
    clean_loss = [true_a * c ** (-true_alpha) for c in compute]
    a, alpha = fit_power(compute, clean_loss)
    assert abs(a - true_a) < 1e-12 and abs(alpha - true_alpha) < 1e-12

    # 只在最大尺度改变斜率。随机留出仍让训练看到 64，主要测试插值；
    # 最大尺度留出只看到旧 regime，才真正测试向目标预算外推。
    changed_loss = clean_loss[:]
    changed_loss[-1] = true_a * 32 ** (-true_alpha) * (64 / 32) ** (-0.05)

    rng = random.Random(7)
    random_holdout = set(rng.sample(range(1, len(compute) - 1), 2))
    _, random_alpha, random_error = fit_and_evaluate(compute, changed_loss, random_holdout)
    _, extrap_alpha, extrap_error = fit_and_evaluate(
        compute, changed_loss, {len(compute) - 1}
    )

    assert max(random_holdout) < len(compute) - 1  # 训练确实见过最大规模。
    assert extrap_error > 0.1
    assert extrap_error > random_error
    print(f"clean alpha={alpha:.3f}")
    print(
        f"random holdout={sorted(random_holdout)}, alpha={random_alpha:.3f}, "
        f"mean error={random_error:.1%}"
    )
    print(f"largest-scale holdout alpha={extrap_alpha:.3f}, error={extrap_error:.1%}")
    print("PASS scaling_fit")


if __name__ == "__main__":
    main()
