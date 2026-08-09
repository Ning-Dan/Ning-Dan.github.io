"""A tiny group-relative advantage and PPO-clipping demonstration."""

import math


def group_advantages(rewards: list[float]) -> list[float]:
    mean = sum(rewards) / len(rewards)
    variance = sum((reward - mean) ** 2 for reward in rewards) / len(rewards)
    std = math.sqrt(variance)
    if std < 1e-12:
        return [0.0 for _ in rewards]
    return [(reward - mean) / std for reward in rewards]


rewards = [0.0, 1.0, 0.0, 1.0]
advantages = group_advantages(rewards)
assert advantages == [-1.0, 1.0, -1.0, 1.0]
print(f"MIXED GROUP rewards={rewards} advantages={advantages}")

all_failure = [0.0, 0.0, 0.0, 0.0]
zero_signal = group_advantages(all_failure)
assert zero_signal == [0.0, 0.0, 0.0, 0.0]
print(f"ALL-FAIL GROUP rewards={all_failure} advantages={zero_signal}")

ratios = [0.7, 0.95, 1.05, 1.4]
clip_width = 0.2
terms = []
for ratio, advantage in zip(ratios, advantages):
    clipped = min(max(ratio, 1.0 - clip_width), 1.0 + clip_width)
    terms.append(min(ratio * advantage, clipped * advantage))
objective = sum(terms) / len(terms)
assert abs(objective - 0.075) < 1e-12
print(f"CLIP CHECK ratios={ratios} terms={[round(x, 3) for x in terms]} objective={objective:.4f}")
print("POST-TRAINING TOY PASS")
