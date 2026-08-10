"""CVAE KL and timestamp-aligned temporal-ensemble mechanics."""

import math


mu, sigma, epsilon = 0.5, 0.8, 0.25
z = mu + sigma * epsilon
kl = 0.5 * (mu**2 + sigma**2 - 1.0 - math.log(sigma**2))
assert abs(z - 0.7) < 1e-12
assert abs(kl - 0.1681435513) < 1e-9
print(f"CVAE CHECK z={z:.3f} kl={kl:.6f}")

# query_time -> predictions for query_time + offset
chunks = {
    0: [0.10, 0.20, 0.30],
    1: [0.24, 0.34, 0.44],
    2: [0.38, 0.48, 0.58],
}
execute_time = 2
candidates = []
for query_time, chunk in chunks.items():
    offset = execute_time - query_time
    if 0 <= offset < len(chunk):
        age = execute_time - query_time
        candidates.append((query_time, chunk[offset], age))

decay = 0.5

# Official ACT code at 742c753 stores candidates from oldest query to newest,
# then applies exp(-k * arange(N)); the oldest prediction gets the most weight.
official_weights = [math.exp(-decay * index) for index in range(len(candidates))]
official_ensemble = sum(weight * item[1] for weight, item in zip(official_weights, candidates)) / sum(official_weights)

# Explicit comparison variant: older predictions decay by physical age.
age_decay_weights = [math.exp(-decay * age) for _, _, age in candidates]
age_decay_ensemble = sum(weight * item[1] for weight, item in zip(age_decay_weights, candidates)) / sum(age_decay_weights)
assert [round(item[1], 2) for item in candidates] == [0.30, 0.34, 0.38]
assert abs(official_ensemble - 0.3271937333) < 1e-9
assert abs(age_decay_ensemble - 0.3528062667) < 1e-9
print(f"ENSEMBLE CHECK execute_time={execute_time} candidates={candidates}")
print(f"OFFICIAL ORDER CHECK weights={[round(x, 6) for x in official_weights]} action={official_ensemble:.6f}")
print(f"AGE DECAY VARIANT weights={[round(x, 6) for x in age_decay_weights]} action={age_decay_ensemble:.6f}")

valid_mask = [1, 1, 0, 0]
target = [1.0, 2.0, 999.0, -999.0]
prediction = [0.8, 2.2, 0.0, 0.0]
masked_mse = sum(mask * (a - b) ** 2 for mask, a, b in zip(valid_mask, target, prediction)) / sum(valid_mask)
valid_l1 = sum(mask * abs(a - b) for mask, a, b in zip(valid_mask, target, prediction)) / sum(valid_mask)
full_tensor_mean_l1 = sum(mask * abs(a - b) for mask, a, b in zip(valid_mask, target, prediction)) / len(valid_mask)
assert abs(masked_mse - 0.04) < 1e-12
assert abs(valid_l1 - 0.2) < 1e-12
assert abs(full_tensor_mean_l1 - 0.1) < 1e-12
print(
    f"MASK CHECK valid={sum(valid_mask)} valid_l1={valid_l1:.6f} "
    f"full_mean_l1={full_tensor_mean_l1:.6f} masked_mse={masked_mse:.6f}"
)
print("ACT MECHANICS PASS")
