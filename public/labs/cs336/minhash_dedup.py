"""独立教学实验：用确定性 MinHash/LSH 找近重复候选。"""

import hashlib


def shingles(text: str, n: int = 3) -> set[str]:
    normalized = " ".join(text.lower().split())
    words = normalized.split()
    return {" ".join(words[i : i + n]) for i in range(max(1, len(words) - n + 1))}


def jaccard(a: set[str], b: set[str]) -> float:
    return len(a & b) / len(a | b) if a or b else 1.0


def stable_hash(seed: int, item: str) -> int:
    # 教学近似：把不同 seed 的 Blake2b 当作近似独立随机排序。
    # 这不是“严格 min-wise independent hash family”的证明。
    payload = f"{seed}:{item}".encode()
    return int.from_bytes(hashlib.blake2b(payload, digest_size=8).digest(), "big")


def minhash(items: set[str], permutations: int = 60) -> tuple[int, ...]:
    assert items, "empty documents need an explicit pipeline policy"
    return tuple(min(stable_hash(seed, item) for item in items) for seed in range(permutations))


def estimated_jaccard(sa: tuple[int, ...], sb: tuple[int, ...]) -> float:
    return sum(a == b for a, b in zip(sa, sb)) / len(sa)


def lsh_candidate(sa: tuple[int, ...], sb: tuple[int, ...], bands: int = 12) -> bool:
    assert len(sa) == len(sb) and len(sa) % bands == 0
    rows = len(sa) // bands
    return any(sa[i : i + rows] == sb[i : i + rows] for i in range(0, len(sa), rows))


def main() -> None:
    a = shingles("the small language model learns from clean training data every day")
    b = shingles("the small language model learns from clean training data each day")
    c = shingles("a robot folds towels with a camera and force sensor")
    sa, sb, sc = minhash(a), minhash(b), minhash(c)
    true_ab = jaccard(a, b)
    estimate = estimated_jaccard(sa, sb)
    assert true_ab > jaccard(a, c)
    assert abs(estimate - true_ab) < 0.25
    assert lsh_candidate(sa, sb)
    assert not lsh_candidate(sa, sc)
    print(f"Jaccard(a,b)={true_ab:.3f}, MinHash estimate={estimate:.3f}")
    print("假设：seeded Blake2b 近似独立随机排列；候选仍须用真实 Jaccard 复核。")
    print("PASS minhash_dedup")


if __name__ == "__main__":
    main()
