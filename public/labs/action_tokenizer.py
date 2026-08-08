"""7D action contract + quantile tokenizer, standard library only.

Run: python public/labs/action_tokenizer.py
"""
from __future__ import annotations

import json
import math
import random
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Sequence


def quantile(values: Sequence[float], q: float) -> float:
    if not values or not 0 <= q <= 1 or not all(math.isfinite(x) for x in values):
        raise ValueError("finite values and q in [0,1] required")
    ordered = sorted(values); p = (len(ordered)-1)*q; left = int(p); right = min(left+1, len(ordered)-1)
    return ordered[left]*(right-p) + ordered[right]*(p-left) if right != left else ordered[left]


@dataclass(frozen=True)
class ActionContract:
    names: tuple[str, ...]
    command_type: str
    frame: str
    units: tuple[str, ...]
    dt_seconds: float
    gripper_semantics: str
    valid_mask: tuple[bool, ...]
    fixed_values: tuple[float | None, ...]
    version: str = "toy-contract-v1"

    def validate(self) -> None:
        width = len(self.names)
        if width != 7 or not (len(self.units) == len(self.valid_mask) == len(self.fixed_values) == width):
            raise ValueError("this lab requires a consistent 7D contract")
        if self.dt_seconds <= 0 or not self.frame or not self.command_type:
            raise ValueError("dt/frame/command_type are required")
        for active, fixed in zip(self.valid_mask, self.fixed_values):
            if active and fixed is not None: raise ValueError("active dimensions cannot have fixed values")
            if not active and (fixed is None or not math.isfinite(fixed)): raise ValueError("inactive dimensions need finite fixed values")


@dataclass
class ActionTokenizer:
    contract: ActionContract
    low: tuple[float | None, ...]
    high: tuple[float | None, ...]
    bins: int
    clipped_low: list[int]
    clipped_high: list[int]

    @classmethod
    def fit(cls, rows: Sequence[Sequence[float]], contract: ActionContract, bins: int = 32) -> "ActionTokenizer":
        contract.validate()
        if not rows or bins < 2 or any(len(row) != 7 for row in rows): raise ValueError("finite 7D training rows required")
        if any(not all(math.isfinite(float(x)) for x in row) for row in rows): raise ValueError("NaN/Inf in training actions")
        lows: list[float | None] = []; highs: list[float | None] = []
        for j, active in enumerate(contract.valid_mask):
            if not active: lows.append(None); highs.append(None); continue
            column = [float(row[j]) for row in rows]
            lo, hi = quantile(column, .01), quantile(column, .99)
            if hi-lo <= 1e-9: raise ValueError(f"active dimension {j} has zero range")
            lows.append(lo); highs.append(hi)
        return cls(contract, tuple(lows), tuple(highs), bins, [0]*7, [0]*7)

    def encode(self, action: Sequence[float]) -> tuple[int, ...]:
        if len(action) != 7 or not all(math.isfinite(float(x)) for x in action): raise ValueError("action must be finite 7D")
        tokens = []
        for j, (value, active, lo, hi) in enumerate(zip(action, self.contract.valid_mask, self.low, self.high)):
            if not active: tokens.append(-1); continue
            assert lo is not None and hi is not None
            if value < lo: self.clipped_low[j] += 1
            if value > hi: self.clipped_high[j] += 1
            clipped = min(hi, max(lo, value)); width = (hi-lo)/self.bins
            tokens.append(min(self.bins-1, max(0, int((clipped-lo)/width))))
        return tuple(tokens)

    def decode(self, tokens: Sequence[int]) -> tuple[float, ...]:
        if len(tokens) != 7: raise ValueError("token width mismatch")
        values = []
        for token, active, fixed, lo, hi in zip(tokens, self.contract.valid_mask, self.contract.fixed_values, self.low, self.high):
            if not active:
                if token != -1: raise ValueError("inactive token must be -1")
                assert fixed is not None; values.append(fixed); continue
            if not 0 <= token < self.bins: raise ValueError("token out of range")
            assert lo is not None and hi is not None
            values.append(lo + (token+.5)*(hi-lo)/self.bins)
        return tuple(values)

    def metadata(self) -> dict:
        return {"contract": asdict(self.contract), "low": self.low, "high": self.high, "bins": self.bins}


def main() -> None:
    contract = ActionContract(
        names=("dx","dy","dz","droll","dpitch","dyaw","gripper"), command_type="eef_delta_pose",
        frame="tool", units=("m","m","m","rad","rad","rad","binary"), dt_seconds=.05,
        gripper_semantics="0=open, 1=closed", valid_mask=(True,True,True,True,True,True,False),
        fixed_values=(None,None,None,None,None,None,0.0),
    )
    rng = random.Random(9)
    train = [tuple([rng.uniform(-.04,.04) for _ in range(3)] + [rng.uniform(-.2,.2) for _ in range(3)] + [0.0]) for _ in range(500)]
    tokenizer = ActionTokenizer.fit(train, contract)
    probe = (.01,-.02,.03,.05,-.1,.15,0.0); tokens = tokenizer.encode(probe); restored = tokenizer.decode(tokens)
    for j, active in enumerate(contract.valid_mask):
        if active:
            assert tokenizer.low[j] is not None and tokenizer.high[j] is not None
            assert abs(probe[j]-restored[j]) <= (tokenizer.high[j]-tokenizer.low[j])/(2*tokenizer.bins)+1e-12
    assert tokens[-1] == -1 and restored[-1] == 0.0
    tokenizer.encode((9,9,9,9,9,9,0)); assert sum(tokenizer.clipped_high) == 6
    try: tokenizer.encode((math.nan,0,0,0,0,0,0))
    except ValueError: pass
    else: raise AssertionError("NaN was accepted")
    with tempfile.TemporaryDirectory(prefix="action-contract-") as directory:
        path = Path(directory)/"metadata.json"; path.write_text(json.dumps(tokenizer.metadata(), ensure_ascii=False), encoding="utf-8")
        loaded = json.loads(path.read_text(encoding="utf-8")); assert loaded["contract"]["frame"] == "tool"
    print("7D tokens:", tokens); print("max active round-trip error:", f"{max(abs(probe[j]-restored[j]) for j in range(6)):.6f}")
    print("clip-high counts:", tokenizer.clipped_high); print("metadata round-trip + NaN rejection: PASS"); print("action tokenizer: ALL CHECKS PASSED")


if __name__ == "__main__": main()
