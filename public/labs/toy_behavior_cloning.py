"""Four small, dependency-free Behavior Cloning experiments.

Run from the repository root:
    python public/labs/toy_behavior_cloning.py

The script is deliberately small enough to read line by line.  It demonstrates:
1. supervised BC and condition ablation;
2. checkpoint round-trip;
3. covariate shift in a closed loop and one DAgger iteration;
4. the conditional-mean failure of MSE on multimodal actions.
"""

from __future__ import annotations

import json
import math
import random
import tempfile
from pathlib import Path
from typing import Callable, Sequence


Row = tuple[list[float], float]


def predict(weights: Sequence[float], features: Sequence[float]) -> float:
    """Linear policy.  The final feature is an explicit constant bias."""
    assert len(weights) == len(features), (len(weights), len(features))
    value = sum(weight * feature for weight, feature in zip(weights, features))
    assert math.isfinite(value)
    return value


def mse(weights: Sequence[float], rows: Sequence[Row]) -> float:
    assert rows, "dataset must not be empty"
    return sum((predict(weights, features) - target) ** 2 for features, target in rows) / len(rows)


def train_linear_policy(
    rows: Sequence[Row], *, steps: int = 1_500, learning_rate: float = 0.08
) -> list[float]:
    """Full-batch gradient descent for mean squared error."""
    assert rows and 0.0 < learning_rate < 1.0
    width = len(rows[0][0])
    assert all(len(features) == width for features, _ in rows)
    weights = [0.0] * width
    for _ in range(steps):
        gradient = [0.0] * width
        for features, target in rows:
            error = predict(weights, features) - target
            for index, feature in enumerate(features):
                gradient[index] += 2.0 * error * feature / len(rows)
        weights = [weight - learning_rate * grad for weight, grad in zip(weights, gradient)]
        assert all(math.isfinite(weight) for weight in weights)
    return weights


def make_supervised_data(seed: int = 7, count: int = 96) -> list[Row]:
    """Features stand in for [visual feature, language token, bias]."""
    rng = random.Random(seed)
    rows: list[Row] = []
    for _ in range(count):
        visual = rng.uniform(-1.0, 1.0)
        language = rng.choice((-1.0, 1.0))
        action = 0.7 * visual + 0.9 * language + 0.15
        rows.append(([visual, language, 1.0], action))
    return rows


def supervised_and_condition_experiment() -> list[float]:
    rows = make_supervised_data()
    initial_loss = mse([0.0, 0.0, 0.0], rows)
    weights = train_linear_policy(rows)
    trained_loss = mse(weights, rows)
    language_permuted = [([x[0], -x[1], 1.0], target) for x, target in rows]
    permuted_loss = mse(weights, language_permuted)

    assert trained_loss < initial_loss * 0.01
    assert permuted_loss > trained_loss + 1.0
    assert max(abs(got - want) for got, want in zip(weights, (0.7, 0.9, 0.15))) < 1e-6
    print("[1/4] supervised BC + condition ablation: PASS")
    print("      weights:", [round(weight, 4) for weight in weights])
    print(f"      train MSE {initial_loss:.4f} -> {trained_loss:.8f}; permuted-language MSE {permuted_loss:.4f}")
    return weights


def checkpoint_experiment(weights: Sequence[float]) -> None:
    probe = [0.25, -1.0, 1.0]
    before = predict(weights, probe)
    with tempfile.TemporaryDirectory(prefix="toy-bc-") as directory:
        checkpoint = Path(directory) / "policy.json"
        checkpoint.write_text(json.dumps({"weights": list(weights)}), encoding="utf-8")
        restored = json.loads(checkpoint.read_text(encoding="utf-8"))["weights"]
    after = predict(restored, probe)
    assert restored == list(weights)
    assert before == after
    print("[2/4] checkpoint save/reload: PASS")
    print(f"      probe output before={before:.6f}, after={after:.6f}")


def expert_action(state: float) -> float:
    """A safe expert: proportional near zero, saturated during recovery."""
    return max(-0.45, min(0.45, -0.8 * state))


def recovery_features(state: float) -> list[float]:
    """The second feature activates only outside the initial expert region."""
    outside = math.copysign(max(abs(state) - 0.25, 0.0), state)
    return [state, outside, 1.0]


def initial_expert_rows() -> list[Row]:
    # The learner initially sees only states close to the nominal trajectory.
    return [(recovery_features(-0.25 + index * 0.01), expert_action(-0.25 + index * 0.01)) for index in range(51)]


def rollout(
    policy: Callable[[float], float], start: float, *, horizon: int = 12
) -> tuple[bool, float, list[float]]:
    """One-dimensional closed loop with an explicit action safety bound."""
    state = start
    trace = [state]
    safe = True
    for _ in range(horizon):
        action = policy(state)
        if not math.isfinite(action) or abs(action) > 0.65:
            safe = False
            break
        state = state + action
        trace.append(state)
    success = safe and abs(state) < 0.05
    return success, max(abs(value) for value in trace), trace


def evaluate_closed_loop(weights: Sequence[float]) -> tuple[int, float]:
    starts = [-1.2, -1.0, -0.9, 0.9, 1.0, 1.2]
    results = [rollout(lambda state: predict(weights, recovery_features(state)), start) for start in starts]
    max_initial_action = max(abs(predict(weights, recovery_features(start))) for start in starts)
    return sum(success for success, _, _ in results), max_initial_action


def covariate_shift_and_dagger_experiment() -> None:
    expert_rows = initial_expert_rows()
    bc_weights = train_linear_policy(expert_rows, steps=2_000, learning_rate=0.08)
    before_successes, before_max_action = evaluate_closed_loop(bc_weights)

    # One DAgger iteration: current policy determines visited recovery states,
    # while the safe expert supplies labels at those states.
    recovery_states: list[float] = []
    for start in (-1.2, -1.0, -0.9, 0.9, 1.0, 1.2):
        state = start
        for _ in range(8):
            recovery_states.append(state)
            unsafe_action = predict(bc_weights, recovery_features(state))
            # A safety supervisor executes the expert during data collection.
            state += expert_action(state) if abs(unsafe_action) > 0.65 else unsafe_action
    dagger_rows = expert_rows + [(recovery_features(state), expert_action(state)) for state in recovery_states]
    dagger_weights = train_linear_policy(dagger_rows, steps=4_000, learning_rate=0.04)
    after_successes, after_max_action = evaluate_closed_loop(dagger_weights)

    assert before_successes == 0, before_successes
    assert after_successes == 6, after_successes
    assert before_max_action > 0.65
    assert after_max_action <= 0.65
    print("[3/4] covariate shift + one DAgger iteration: PASS")
    print(f"      closed-loop successes {before_successes}/6 -> {after_successes}/6")
    print(f"      max initial |action| {before_max_action:.2f} -> {after_max_action:.2f} (safety limit 0.65)")
    print("      BC weights:", [round(value, 3) for value in bc_weights])
    print("      DAgger weights:", [round(value, 3) for value in dagger_weights])


def multimodal_mse_experiment() -> None:
    # Identical observation, two equally valid modes: go left or go right.
    actions = [-1.0, 1.0] * 50
    mse_optimum = sum(actions) / len(actions)
    loss_at_mean = sum((mse_optimum - action) ** 2 for action in actions) / len(actions)
    assert abs(mse_optimum) < 1e-12
    assert math.isclose(loss_at_mean, 1.0)
    assert min(abs(mse_optimum - mode) for mode in (-1.0, 1.0)) == 1.0
    print("[4/4] multimodal action / conditional-mean failure: PASS")
    print(f"      expert modes = [-1, +1], MSE prediction = {mse_optimum:.1f}, MSE = {loss_at_mean:.1f}")
    print("      interpretation: the regression optimum is between both valid actions")


def main() -> None:
    weights = supervised_and_condition_experiment()
    checkpoint_experiment(weights)
    covariate_shift_and_dagger_experiment()
    multimodal_mse_experiment()
    print("\nToy Behavior Cloning lab: ALL CHECKS PASSED")


if __name__ == "__main__":
    main()
