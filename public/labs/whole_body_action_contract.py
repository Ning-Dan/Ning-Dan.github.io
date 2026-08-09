"""Example whole-body action contract: validate, normalize, pad, slice and fault-inject.

The dimensions are an EXAMPLE for teaching. Replace them with the real robot inventory.
"""

from dataclasses import dataclass
import math


@dataclass(frozen=True)
class ActionSlice:
    name: str
    size: int
    command_type: str
    unit: str
    limit: float
    modes: tuple[str, ...]


SLICES = (
    ActionSlice("left_arm", 7, "joint_position_delta", "rad", 0.08, ("manipulate", "recover")),
    ActionSlice("left_gripper", 1, "position", "normalized_0_1", 1.0, ("manipulate", "recover")),
    ActionSlice("right_arm", 7, "joint_position_delta", "rad", 0.08, ("manipulate", "recover")),
    ActionSlice("right_gripper", 1, "position", "normalized_0_1", 1.0, ("manipulate", "recover")),
    ActionSlice("waist", 2, "joint_position_delta", "rad", 0.04, ("manipulate", "recover")),
    ActionSlice("base", 2, "velocity", "m_s,rad_s", 0.30, ("navigate", "recover")),
)
PAD_DIM = 32
ACTIVE_DIM = sum(item.size for item in SLICES)
assert ACTIVE_DIM <= PAD_DIM


def offsets() -> dict[str, tuple[int, int]]:
    result = {}
    cursor = 0
    for item in SLICES:
        result[item.name] = (cursor, cursor + item.size)
        cursor += item.size
    return result


OFFSETS = offsets()
means = [0.0] * ACTIVE_DIM
scales = [0.5 + 0.01 * index for index in range(ACTIVE_DIM)]
physical = [0.01 * (index + 1) for index in range(ACTIVE_DIM)]


def validate(values: list[float]) -> None:
    if len(values) != ACTIVE_DIM:
        raise ValueError(f"shape mismatch: {len(values)} != {ACTIVE_DIM}")
    if not all(math.isfinite(value) for value in values):
        raise ValueError("non-finite action")


validate(physical)
normalized = [(value - mean) / scale for value, mean, scale in zip(physical, means, scales)]
padded = normalized + [0.0] * (PAD_DIM - ACTIVE_DIM)
restored = [value * scale + mean for value, mean, scale in zip(padded[:ACTIVE_DIM], means, scales)]
max_error = max(abs(a - b) for a, b in zip(restored, physical))
assert len(padded) == PAD_DIM and max_error < 1e-12

mode = "manipulate"
active_groups = [item.name for item in SLICES if mode in item.modes]
assert "base" not in active_groups and "waist" in active_groups

print(f"CONTRACT active_dim={ACTIVE_DIM} pad_dim={PAD_DIM} mode={mode}")
for item in SLICES:
    start, end = OFFSETS[item.name]
    print(f"SLICE {item.name:14s} [{start:02d}:{end:02d}] type={item.command_type} unit={item.unit} modes={item.modes}")
print(f"ROUND-TRIP max_error={max_error:.3e} active_groups={active_groups}")

try:
    invalid = physical.copy()
    invalid[3] = float("nan")
    validate(invalid)
except ValueError as error:
    print(f"FAULT-INJECTION caught={error}")
else:
    raise AssertionError("NaN fault was not caught")

print("WHOLE-BODY CONTRACT PASS (EXAMPLE DIMENSIONS ONLY)")
