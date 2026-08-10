"""独立教学实验：GRPO 的组内 advantage 与 PPO-style clipping。"""

import math
import statistics


def group_advantages(
    rewards: list[float], std_correction: int | None = 0
) -> list[float]:
    """中心化奖励；std_correction=0 是 population，1 是 sample，None 表示不除。"""
    mean = statistics.fmean(rewards)
    centered = [r - mean for r in rewards]
    if std_correction is None:
        return centered
    assert std_correction in (0, 1)
    std = statistics.stdev(rewards) if std_correction == 1 else statistics.pstdev(rewards)
    if std == 0:
        return [0.0 for _ in rewards]
    return [x / std for x in centered]


def group_mean_gradient_scale(group_size: int) -> float:
    """iid rollout 下，包含自身的 group-mean baseline 导致的期望常数缩放。"""
    assert group_size > 1
    return (group_size - 1) / group_size


def clipped_surrogate(logp: float, old_logp: float, advantage: float, epsilon: float = 0.2) -> float:
    ratio = math.exp(logp - old_logp)
    clipped = min(max(ratio, 1 - epsilon), 1 + epsilon)
    return min(ratio * advantage, clipped * advantage)


def aggregate_token_losses(
    losses: list[list[float]], mode: str, constant: int | None = None
) -> float:
    if mode == "sequence":
        return statistics.fmean(statistics.fmean(sequence) for sequence in losses)
    if mode == "constant":
        assert constant is not None and constant > 0
        return sum(sum(sequence) for sequence in losses) / constant
    raise ValueError(f"unknown mode: {mode}")


def token_ratios(new_logp: list[float], old_logp: list[float]) -> list[float]:
    assert len(new_logp) == len(old_logp)
    return [math.exp(new - old) for new, old in zip(new_logp, old_logp)]


def sequence_ratio(new_logp: list[float], old_logp: list[float]) -> float:
    """GSPO-style示意：先平均 response log-ratio，再指数化。"""
    assert len(new_logp) == len(old_logp) and new_logp
    return math.exp(statistics.fmean(new - old for new, old in zip(new_logp, old_logp)))


def main() -> None:
    rewards = [1.0, 1.0, 0.0, 0.0]
    population_advantages = group_advantages(rewards, std_correction=0)
    sample_advantages = group_advantages(rewards, std_correction=1)
    centered = group_advantages(rewards, std_correction=None)
    assert abs(sum(population_advantages)) < 1e-12
    assert population_advantages == [1.0, 1.0, -1.0, -1.0]
    assert all(abs(value) < 1 for value in sample_advantages)
    assert centered == [0.5, 0.5, -0.5, -0.5]
    assert group_advantages([0.0, 0.0, 0.0], 0) == [0.0, 0.0, 0.0]
    assert group_advantages([1.0, 1.0, 1.0], 1) == [0.0, 0.0, 0.0]
    assert group_mean_gradient_scale(4) == 0.75

    positive = clipped_surrogate(math.log(1.5), 0.0, advantage=1.0)
    assert abs(positive - 1.2) < 1e-12
    negative = clipped_surrogate(math.log(0.5), 0.0, advantage=-1.0)
    assert abs(negative - (-0.8)) < 1e-12

    losses = [[1.0, 1.0], [1.0] * 8]
    sequence_normalized = aggregate_token_losses(losses, "sequence")
    constant_normalized = aggregate_token_losses(losses, "constant", constant=16)
    assert sequence_normalized == 1.0
    assert constant_normalized == 10 / 16

    new_logp = [math.log(1.2), math.log(0.8)]
    old_logp = [0.0, 0.0]
    per_token = token_ratios(new_logp, old_logp)
    per_sequence = sequence_ratio(new_logp, old_logp)
    assert abs(per_token[0] - 1.2) < 1e-12 and abs(per_token[1] - 0.8) < 1e-12
    assert abs(per_sequence - math.sqrt(1.2 * 0.8)) < 1e-12

    print("population advantages:", population_advantages)
    print("sample advantages:", [round(value, 6) for value in sample_advantages])
    print(f"group-mean gradient scale for G=4: {group_mean_gradient_scale(4):.2f}")
    print(f"sequence loss={sequence_normalized:.3f}; constant loss={constant_normalized:.3f}")
    print(f"token ratios={per_token}; response ratio={per_sequence:.6f}")
    print("PASS grpo_mechanics")


if __name__ == "__main__":
    main()
