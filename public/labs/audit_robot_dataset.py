#!/usr/bin/env python3
"""Audit a small robot episode JSONL manifest without third-party packages.

This checks metadata and alignment, not image contents or robot safety. Use
`--write-demo` to inspect the expected record shape before adapting an export.
"""

from __future__ import annotations

import argparse
import json
import math
import statistics
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any


REQUIRED = {
    "episode_id",
    "split",
    "frame_index",
    "timestamp_s",
    "action_timestamp_s",
    "task_id",
    "language",
    "images",
    "state",
    "action",
    "action_valid",
    "action_contract_revision",
}
ALLOWED_SPLITS = {"train", "val", "test"}


def make_demo() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    episode_splits = ["train", "train", "train", "train", "val", "test"]
    for episode_number, split in enumerate(episode_splits):
        episode_id = f"episode-{episode_number:03d}"
        for frame_index in range(5):
            timestamp = episode_number * 10.0 + frame_index * 0.1
            records.append(
                {
                    "episode_id": episode_id,
                    "split": split,
                    "frame_index": frame_index,
                    "timestamp_s": timestamp,
                    "action_timestamp_s": timestamp + 0.02,
                    "task_id": "place-red-block",
                    "language": "put the red block in the tray",
                    "images": {
                        "front": {
                            "path": f"{episode_id}/front/{frame_index:06d}.jpg",
                            "timestamp_s": timestamp - 0.005,
                        },
                        "wrist": {
                            "path": f"{episode_id}/wrist/{frame_index:06d}.jpg",
                            "timestamp_s": timestamp + 0.004,
                        },
                    },
                    "state": [
                        0.1 * episode_number,
                        0.02 * frame_index,
                        -0.01 * frame_index,
                        1.0 if frame_index < 3 else 0.0,
                    ],
                    "action": [
                        0.03 * (frame_index + 1),
                        -0.01 * (episode_number + 1),
                        1.0 if frame_index < 2 else 0.0,
                    ],
                    "action_valid": [True, True, True],
                    "action_contract_revision": "eef-delta-base-m-v1",
                }
            )
    return records


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"line {line_number}: invalid JSON: {exc}") from exc
            if not isinstance(item, dict):
                raise ValueError(f"line {line_number}: each record must be an object")
            records.append(item)
    return records


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def is_finite_vector(value: Any) -> bool:
    return (
        isinstance(value, list)
        and bool(value)
        and all(isinstance(item, (int, float)) and not isinstance(item, bool) and math.isfinite(item) for item in value)
    )


def audit(records: list[dict[str, Any]]) -> tuple[list[str], list[str], dict[str, Any]]:
    errors: list[str] = []
    warnings: list[str] = []
    episodes: dict[str, list[tuple[int, dict[str, Any]]]] = defaultdict(list)
    episode_splits: dict[str, set[str]] = defaultdict(set)
    state_dim: int | None = None
    action_dim: int | None = None
    train_actions: list[list[float]] = []

    if not records:
        return ["manifest is empty"], warnings, {}

    for row_number, record in enumerate(records, start=1):
        missing = sorted(REQUIRED - record.keys())
        if missing:
            errors.append(f"row {row_number}: missing {missing}")
            continue

        episode_id = record["episode_id"]
        split = record["split"]
        frame_index = record["frame_index"]
        if not isinstance(episode_id, str) or not episode_id:
            errors.append(f"row {row_number}: invalid episode_id")
            continue
        if split not in ALLOWED_SPLITS:
            errors.append(f"row {row_number}: split must be one of {sorted(ALLOWED_SPLITS)}")
        if not isinstance(frame_index, int) or isinstance(frame_index, bool) or frame_index < 0:
            errors.append(f"row {row_number}: frame_index must be a non-negative integer")
            continue

        episodes[episode_id].append((row_number, record))
        episode_splits[episode_id].add(split)

        state = record["state"]
        action = record["action"]
        valid = record["action_valid"]
        if not is_finite_vector(state):
            errors.append(f"row {row_number}: state must be a non-empty finite numeric vector")
        elif state_dim is None:
            state_dim = len(state)
        elif len(state) != state_dim:
            errors.append(f"row {row_number}: state dim {len(state)} != {state_dim}")

        if not is_finite_vector(action):
            errors.append(f"row {row_number}: action must be a non-empty finite numeric vector")
        elif action_dim is None:
            action_dim = len(action)
        elif len(action) != action_dim:
            errors.append(f"row {row_number}: action dim {len(action)} != {action_dim}")

        if not isinstance(valid, list) or len(valid) != len(action) or not all(isinstance(item, bool) for item in valid):
            errors.append(f"row {row_number}: action_valid must be bool[action_dim]")
        elif split == "train" and is_finite_vector(action):
            train_actions.append([float(item) if flag else math.nan for item, flag in zip(action, valid)])

        timestamp = record["timestamp_s"]
        action_timestamp = record["action_timestamp_s"]
        if not all(isinstance(item, (int, float)) and not isinstance(item, bool) and math.isfinite(item) for item in (timestamp, action_timestamp)):
            errors.append(f"row {row_number}: timestamps must be finite numbers")
        elif action_timestamp < timestamp:
            errors.append(f"row {row_number}: action timestamp precedes observation")
        elif action_timestamp - timestamp > 0.2:
            warnings.append(f"row {row_number}: observation-to-action lag exceeds 200 ms")

        images = record["images"]
        if not isinstance(images, dict) or not images:
            errors.append(f"row {row_number}: images must contain at least one camera")
        else:
            for camera, image in images.items():
                if not isinstance(image, dict) or not isinstance(image.get("path"), str):
                    errors.append(f"row {row_number}: camera {camera!r} needs a path")
                    continue
                image_time = image.get("timestamp_s")
                if not isinstance(image_time, (int, float)) or isinstance(image_time, bool) or not math.isfinite(image_time):
                    errors.append(f"row {row_number}: camera {camera!r} needs a finite timestamp")
                elif isinstance(timestamp, (int, float)) and abs(image_time - timestamp) > 0.05:
                    warnings.append(f"row {row_number}: camera {camera!r} differs from decision time by >50 ms")

    for episode_id, splits in episode_splits.items():
        if len(splits) != 1:
            errors.append(f"episode {episode_id}: crosses splits {sorted(splits)}")

    for episode_id, rows in episodes.items():
        previous_frame: int | None = None
        previous_time: float | None = None
        for row_number, record in rows:
            frame_index = record["frame_index"]
            timestamp = record["timestamp_s"]
            if previous_frame is not None and frame_index != previous_frame + 1:
                errors.append(f"episode {episode_id}, row {row_number}: non-contiguous frame index")
            if previous_time is not None and timestamp <= previous_time:
                errors.append(f"episode {episode_id}, row {row_number}: timestamp is not increasing")
            previous_frame = frame_index
            previous_time = timestamp

    split_episode_counts = {
        split: sum(1 for splits in episode_splits.values() if splits == {split})
        for split in sorted(ALLOWED_SPLITS)
    }
    if not train_actions or action_dim is None:
        errors.append("no valid train actions for normalization")
        return errors, warnings, {"split_episodes": split_episode_counts}

    means: list[float] = []
    stds: list[float] = []
    max_roundtrip_error = 0.0
    for dimension in range(action_dim):
        values = [row[dimension] for row in train_actions if math.isfinite(row[dimension])]
        if not values:
            errors.append(f"action dim {dimension}: no valid train values")
            means.append(0.0)
            stds.append(1.0)
            continue
        mean = statistics.fmean(values)
        std = statistics.pstdev(values)
        if std < 1e-12:
            warnings.append(f"action dim {dimension}: constant in train; use an explicit fixed-value rule")
            std = 1.0
        means.append(mean)
        stds.append(std)
        for value in values:
            restored = ((value - mean) / std) * std + mean
            max_roundtrip_error = max(max_roundtrip_error, abs(restored - value))

    report = {
        "records": len(records),
        "episodes": len(episodes),
        "split_episodes": split_episode_counts,
        "state_dim": state_dim,
        "action_dim": action_dim,
        "train_action_mean": means,
        "train_action_std": stds,
        "normalization_roundtrip_max_error": max_roundtrip_error,
    }
    return errors, warnings, report


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--demo", action="store_true", help="audit an in-memory valid demo manifest")
    source.add_argument("--input", type=Path, help="audit a JSONL manifest")
    source.add_argument("--write-demo", type=Path, help="write and audit the valid demo JSONL")
    parser.add_argument("--inject-error", choices=("split", "nan"), help="demo only: prove the audit rejects bad data")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.input:
        if args.inject_error:
            print("--inject-error is only valid with --demo or --write-demo", file=sys.stderr)
            return 2
        records = load_jsonl(args.input)
    else:
        records = make_demo()
        if args.inject_error == "split":
            records[1]["split"] = "val"
        elif args.inject_error == "nan":
            records[0]["action"][0] = float("nan")
        if args.write_demo:
            write_jsonl(args.write_demo, records)
            print(f"WROTE {args.write_demo}")

    errors, warnings, report = audit(records)
    print(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False))
    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}")
    if errors:
        print("AUDIT FAIL")
        return 1
    print("AUDIT PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
