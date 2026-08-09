"""Deterministic arithmetic checks for the VLA math foundations lesson."""

import math


def gaussian_nll(target: float, mean: float, sigma: float) -> float:
    return 0.5 * ((target - mean) / sigma) ** 2 + math.log(sigma * math.sqrt(2.0 * math.pi))


target, mean, sigma = 1.0, 0.6, 0.5
squared_error = (target - mean) ** 2
nll = gaussian_nll(target, mean, sigma)
expected_nll = squared_error / (2.0 * sigma**2) + math.log(sigma * math.sqrt(2.0 * math.pi))
assert abs(nll - expected_nll) < 1e-12
print(f"NLL CHECK squared_error={squared_error:.4f} nll={nll:.6f}")

mu, posterior_sigma = 0.5, 0.8
kl = 0.5 * (mu**2 + posterior_sigma**2 - 1.0 - math.log(posterior_sigma**2))
assert abs(kl - 0.1681435513) < 1e-9
print(f"KL CHECK mu={mu:.1f} sigma={posterior_sigma:.1f} kl={kl:.6f}")

rewards = [0.0, 0.0, 1.0]
values = [0.6, 0.8, 0.9]
gamma = 0.9
returns = [0.0] * len(rewards)
running = 0.0
for index in range(len(rewards) - 1, -1, -1):
    running = rewards[index] + gamma * running
    returns[index] = running
advantages = [ret - value for ret, value in zip(returns, values)]
assert all(abs(a - b) < 1e-12 for a, b in zip(returns, [0.81, 0.9, 1.0]))
assert all(abs(a - b) < 1e-12 for a, b in zip(advantages, [0.21, 0.1, 0.1]))
print(f"RL CHECK returns={returns} advantages={[round(x, 3) for x in advantages]}")


def loss(weight: float) -> float:
    return (2.0 * weight - 3.0) ** 2


weight, h = 0.4, 1e-5
analytic = 4.0 * (2.0 * weight - 3.0)
finite_difference = (loss(weight + h) - loss(weight - h)) / (2.0 * h)
assert abs(analytic - finite_difference) < 1e-8
print(f"GRAD CHECK analytic={analytic:.6f} finite_difference={finite_difference:.6f}")

position, target_position, steps = -1.0, 2.0, 20
dt = 1.0 / steps
velocity = target_position - position
for _ in range(steps):
    position += dt * velocity
assert abs(position - target_position) < 1e-12
print(f"FLOW CHECK endpoint={position:.6f} target={target_position:.6f}")
print("MATH CHECKS PASS")
