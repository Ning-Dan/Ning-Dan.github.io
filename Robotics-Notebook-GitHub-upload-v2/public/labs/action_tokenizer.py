"""Per-dimension quantile action tokenizer with boundary tests.

Run: python3 action_tokenizer.py
Dependencies: Python 3.10+ standard library only.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import floor, isfinite
from typing import Iterable, Sequence


def quantile(values: Sequence[float], q: float) -> float:
    if not values or not 0.0 <= q <= 1.0:
        raise ValueError("non-empty values and q in [0, 1] required")
    ordered = sorted(float(value) for value in values)
    index = (len(ordered) - 1) * q
    left = floor(index)
    right = min(left + 1, len(ordered) - 1)
    fraction = index - left
    return ordered[left] * (1.0 - fraction) + ordered[right] * fraction


@dataclass(frozen=True)
class ActionTokenizer:
    low: tuple[float, ...]
    high: tuple[float, ...]
    bins: int

    @classmethod
    def fit(cls, rows: Iterable[Sequence[float]], bins: int = 256) -> "ActionTokenizer":
        data = [tuple(map(float, row)) for row in rows]
        if not data or bins < 2:
            raise ValueError("data and at least two bins are required")
        width = len(data[0])
        if width == 0 or any(len(row) != width for row in data):
            raise ValueError("all action rows must have the same nonzero width")
        columns = [[row[j] for row in data] for j in range(width)]
        low = tuple(quantile(column, 0.01) for column in columns)
        high = tuple(quantile(column, 0.99) for column in columns)
        if any(not isfinite(lo + hi) or hi <= lo for lo, hi in zip(low, high)):
            raise ValueError("each action dimension needs a finite, nonzero range")
        return cls(low, high, bins)

    def encode(self, action: Sequence[float]) -> tuple[int, ...]:
        if len(action) != len(self.low):
            raise ValueError("action width mismatch")
        tokens = []
        for value, lo, hi in zip(action, self.low, self.high):
            clipped = min(hi, max(lo, float(value)))
            delta = (hi - lo) / self.bins
            tokens.append(min(self.bins - 1, max(0, floor((clipped - lo) / delta))))
        return tuple(tokens)

    def decode(self, tokens: Sequence[int]) -> tuple[float, ...]:
        if len(tokens) != len(self.low):
            raise ValueError("token width mismatch")
        values = []
        for token, lo, hi in zip(tokens, self.low, self.high):
            if not 0 <= token < self.bins:
                raise ValueError("token out of range")
            delta = (hi - lo) / self.bins
            values.append(lo + (token + 0.5) * delta)
        return tuple(values)


def smoke_test() -> None:
    train = [(i / 100.0, -i / 50.0) for i in range(-100, 101)]
    tokenizer = ActionTokenizer.fit(train, bins=32)
    action = (0.24, -0.48)
    tokens = tokenizer.encode(action)
    decoded = tokenizer.decode(tokens)
    assert all(0 <= token < 32 for token in tokens), tokens
    for value, restored, lo, hi in zip(action, decoded, tokenizer.low, tokenizer.high):
        assert abs(value - restored) <= (hi - lo) / (2 * tokenizer.bins) + 1e-12
    assert tokenizer.encode((1e9, -1e9)) == (31, 0)
    print("tokens:", tokens, "decoded:", tuple(round(v, 4) for v in decoded))
    print("action tokenizer smoke test: PASS")


if __name__ == "__main__":
    smoke_test()
