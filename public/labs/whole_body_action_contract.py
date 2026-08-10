"""Executable example of a whole-body action contract.

The dimensions, limits, frames and joint names are teaching examples.  They
must be replaced by values from the target robot before hardware execution.

Run: python public/labs/whole_body_action_contract.py
"""

from __future__ import annotations

from dataclasses import dataclass
import math


@dataclass(frozen=True)
class ActionSlice:
    name: str
    joint_names: tuple[str, ...]
    command_type: str
    frame: str
    units: tuple[str, ...]
    limits: tuple[float, ...]
    modes: tuple[str, ...]
    action_dt_s: float = 0.05
    normalization: str = "quantile_-1_1"
    normalization_revision: str = "teaching-q01-q99-v1"

    @property
    def size(self) -> int:
        return len(self.joint_names)

    def validate_metadata(self) -> None:
        if self.size == 0 or len(self.units) != self.size or len(self.limits) != self.size:
            raise ValueError(f"{self.name}: metadata shape mismatch")
        if self.action_dt_s <= 0 or any(limit <= 0 for limit in self.limits):
            raise ValueError(f"{self.name}: non-positive dt/limit")


SLICES = (
    ActionSlice("left_arm", tuple(f"left_joint_{i}" for i in range(7)), "joint_position_delta", "left_arm_joint", ("rad",) * 7, (0.08,) * 7, ("manipulate", "recover")),
    ActionSlice("left_gripper", ("left_gripper",), "position", "left_gripper", ("normalized_0_1",), (1.0,), ("manipulate", "recover")),
    ActionSlice("right_arm", tuple(f"right_joint_{i}" for i in range(7)), "joint_position_delta", "right_arm_joint", ("rad",) * 7, (0.08,) * 7, ("manipulate", "recover")),
    ActionSlice("right_gripper", ("right_gripper",), "position", "right_gripper", ("normalized_0_1",), (1.0,), ("manipulate", "recover")),
    ActionSlice("waist", ("waist_yaw", "waist_pitch"), "joint_position_delta", "waist_joint", ("rad", "rad"), (0.04, 0.04), ("manipulate", "recover")),
    ActionSlice("base", ("base_vx", "base_wz"), "velocity", "base_link", ("m/s", "rad/s"), (0.30, 0.60), ("navigate", "recover")),
)
PAD_DIM = 32
ACTIVE_DIM = sum(item.size for item in SLICES)
assert ACTIVE_DIM <= PAD_DIM
for action_slice in SLICES:
    action_slice.validate_metadata()


def offsets() -> dict[str, tuple[int, int]]:
    result: dict[str, tuple[int, int]] = {}
    cursor = 0
    for action_slice in SLICES:
        result[action_slice.name] = (cursor, cursor + action_slice.size)
        cursor += action_slice.size
    return result


OFFSETS = offsets()


def quantile_bounds() -> tuple[list[float], list[float]]:
    q01: list[float] = []
    q99: list[float] = []
    for action_slice in SLICES:
        for unit, limit in zip(action_slice.units, action_slice.limits):
            low = 0.0 if unit == "normalized_0_1" else -limit
            q01.append(low)
            q99.append(limit)
    return q01, q99


Q01, Q99 = quantile_bounds()


def validate_physical(values: list[float]) -> None:
    if len(values) != ACTIVE_DIM:
        raise ValueError(f"shape mismatch: {len(values)} != {ACTIVE_DIM}")
    if not all(math.isfinite(value) for value in values):
        raise ValueError("non-finite action")
    for action_slice in SLICES:
        start, end = OFFSETS[action_slice.name]
        for value, unit, limit in zip(values[start:end], action_slice.units, action_slice.limits):
            if unit == "normalized_0_1":
                valid = 0.0 <= value <= 1.0
            else:
                valid = abs(value) <= limit
            if not valid:
                raise ValueError(f"{action_slice.name}: limit exceeded")


def normalize_quantile(values: list[float]) -> list[float]:
    validate_physical(values)
    return [2.0 * (value - low) / (high - low) - 1.0 for value, low, high in zip(values, Q01, Q99)]


def denormalize_quantile(values: list[float]) -> list[float]:
    if len(values) != ACTIVE_DIM or not all(math.isfinite(value) for value in values):
        raise ValueError("invalid normalized action")
    restored = [low + 0.5 * (value + 1.0) * (high - low) for value, low, high in zip(values, Q01, Q99)]
    validate_physical(restored)
    return restored


def pad(values: list[float]) -> tuple[list[float], list[bool]]:
    if len(values) != ACTIVE_DIM:
        raise ValueError("active action shape mismatch")
    return values + [0.0] * (PAD_DIM - ACTIVE_DIM), [True] * ACTIVE_DIM + [False] * (PAD_DIM - ACTIVE_DIM)


def slice_mode(values: list[float], mode: str) -> tuple[dict[str, tuple[float, ...]], list[bool]]:
    validate_physical(values)
    selected: dict[str, tuple[float, ...]] = {}
    mode_mask = [False] * ACTIVE_DIM
    for action_slice in SLICES:
        start, end = OFFSETS[action_slice.name]
        if mode in action_slice.modes:
            selected[action_slice.name] = tuple(values[start:end])
            mode_mask[start:end] = [True] * action_slice.size
    if not selected:
        raise ValueError(f"unsupported mode: {mode}")
    return selected, mode_mask


def smoke_test() -> None:
    physical: list[float] = []
    for action_slice in SLICES:
        for unit, limit in zip(action_slice.units, action_slice.limits):
            physical.append(0.5 if unit == "normalized_0_1" else 0.25 * limit)

    normalized = normalize_quantile(physical)
    padded, valid_mask = pad(normalized)
    restored = denormalize_quantile(padded[:ACTIVE_DIM])
    selected, mode_mask = slice_mode(restored, "manipulate")
    max_error = max(abs(before - after) for before, after in zip(physical, restored))

    assert len(padded) == PAD_DIM and sum(valid_mask) == ACTIVE_DIM
    assert max_error < 1e-12
    assert "base" not in selected and "waist" in selected
    base_start, base_end = OFFSETS["base"]
    assert not any(mode_mask[base_start:base_end])

    print(f"CONTRACT active_dim={ACTIVE_DIM} pad_dim={PAD_DIM} mode=manipulate")
    for action_slice in SLICES:
        start, end = OFFSETS[action_slice.name]
        print(
            f"SLICE {action_slice.name:14s} [{start:02d}:{end:02d}] "
            f"type={action_slice.command_type} frame={action_slice.frame} "
            f"units={action_slice.units} dt={action_slice.action_dt_s:.2f}s "
            f"norm={action_slice.normalization_revision}"
        )
    print(f"ROUND-TRIP max_error={max_error:.3e} active_groups={list(selected)}")
    print(f"MASK valid={sum(valid_mask)}/{PAD_DIM} mode_active={sum(mode_mask)}/{ACTIVE_DIM}")

    for label, invalid in (
        ("non-finite", physical[:3] + [float("nan")] + physical[4:]),
        ("limit", [Q99[0] * 2.0] + physical[1:]),
    ):
        try:
            validate_physical(invalid)
        except ValueError as error:
            print(f"FAULT-INJECTION {label} caught={error}")
        else:
            raise AssertionError(f"{label} fault was not caught")

    print("WHOLE-BODY CONTRACT PASS (EXAMPLE METADATA ONLY)")


if __name__ == "__main__":
    smoke_test()
