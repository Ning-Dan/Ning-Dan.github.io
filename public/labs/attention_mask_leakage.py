"""Minimal attention-mask and future-label leakage experiment.

This script uses only the Python standard library.  It does not train a VLA;
it isolates one protocol question: can an earlier action position read a later
clean action label?

Run: python public/labs/attention_mask_leakage.py
"""

from __future__ import annotations

from math import exp, isfinite, sqrt
from typing import Callable, Sequence


Vector = tuple[float, ...]
Mask = Callable[[int, int], bool]


def dot(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise ValueError("dot-product width mismatch")
    return sum(a * b for a, b in zip(left, right))


def softmax(scores: Sequence[float]) -> list[float]:
    finite_scores = [score for score in scores if isfinite(score)]
    if not finite_scores:
        raise ValueError("a query must be allowed to attend to at least one key")
    maximum = max(finite_scores)
    numerators = [0.0 if not isfinite(score) else exp(score - maximum) for score in scores]
    denominator = sum(numerators)
    return [value / denominator for value in numerators]


def attend(tokens: Sequence[Vector], query_index: int, mask: Mask) -> tuple[Vector, list[float]]:
    """Single-head self-attention with identity Q/K/V projections."""
    width = len(tokens[0])
    if width == 0 or any(len(token) != width for token in tokens):
        raise ValueError("all tokens need the same nonzero hidden width")
    query = tokens[query_index]
    scores = [
        dot(query, key) / sqrt(width) if mask(query_index, key_index) else float("-inf")
        for key_index, key in enumerate(tokens)
    ]
    weights = softmax(scores)
    output = tuple(sum(weight * token[j] for weight, token in zip(weights, tokens)) for j in range(width))
    return output, weights


def prefix_causal_mask(prefix_length: int) -> Mask:
    """Prefix tokens see the prefix; action token i sees prefix and actions <= i."""
    def allowed(query_index: int, key_index: int) -> bool:
        if query_index < prefix_length:
            return key_index < prefix_length
        return key_index < prefix_length or key_index <= query_index

    return allowed


def action_suffix_mask(prefix_length: int) -> Mask:
    """Action slots may communicate bidirectionally; prefix cannot read the suffix."""
    def allowed(query_index: int, key_index: int) -> bool:
        if query_index < prefix_length:
            return key_index < prefix_length
        return True

    return allowed


def no_mask(_query_index: int, _key_index: int) -> bool:
    return True


def max_difference(left: Sequence[float], right: Sequence[float]) -> float:
    return max(abs(a - b) for a, b in zip(left, right))


def smoke_test() -> None:
    names = ["image", "language", "state", "action_0", "action_1"]
    base: list[Vector] = [
        (1.0, 0.0, 0.2),
        (0.0, 1.0, 0.1),
        (0.5, 0.5, 1.0),
        (0.8, -0.2, 0.3),
        (-0.4, 0.9, -0.6),
    ]
    changed = list(base)
    changed[-1] = (8.0, -9.0, 7.0)  # Pretend a future clean label changed.

    action_0 = names.index("action_0")
    future_action = names.index("action_1")
    causal = prefix_causal_mask(prefix_length=3)
    suffix = action_suffix_mask(prefix_length=3)

    causal_before, causal_weights = attend(base, action_0, causal)
    causal_after, _ = attend(changed, action_0, causal)
    open_before, open_weights = attend(base, action_0, no_mask)
    open_after, _ = attend(changed, action_0, no_mask)
    suffix_before, suffix_weights = attend(base, action_0, suffix)
    suffix_after, _ = attend(changed, action_0, suffix)

    causal_delta = max_difference(causal_before, causal_after)
    open_delta = max_difference(open_before, open_after)
    suffix_delta = max_difference(suffix_before, suffix_after)

    assert causal_weights[future_action] < 1e-12
    assert causal_delta < 1e-12
    assert open_weights[future_action] > 0.0 and open_delta > 0.1
    assert suffix_weights[future_action] > 0.0 and suffix_delta > 0.1
    assert all(isfinite(value) for value in causal_before + open_before + suffix_before)

    def rounded(values: Sequence[float]) -> list[float]:
        return [round(value, 4) for value in values]

    print("tokens:", names)
    print("prefix-causal weights from action_0:", rounded(causal_weights))
    print("unmasked weights from action_0:     ", rounded(open_weights))
    print("action-suffix weights from action_0:", rounded(suffix_weights))
    print(f"future-label perturbation | causal={causal_delta:.6f}, unmasked={open_delta:.6f}, suffix={suffix_delta:.6f}")
    print("PASS: an autoregressive action token cannot read a future clean action label")
    print("NOTE: bidirectional suffix attention is valid only when the suffix contains noisy/latent slots, not clean future labels")


if __name__ == "__main__":
    smoke_test()
