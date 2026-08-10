"""独立教学实验：在很小的 UTF-8 语料上训练 byte-level BPE。"""

from collections import Counter


def pair_counts(words: list[list[bytes]]) -> Counter[tuple[bytes, bytes]]:
    return Counter((word[i], word[i + 1]) for word in words for i in range(len(word) - 1))


def merge_once(tokens: list[bytes], pair: tuple[bytes, bytes]) -> list[bytes]:
    out: list[bytes] = []
    i = 0
    while i < len(tokens):
        if i + 1 < len(tokens) and (tokens[i], tokens[i + 1]) == pair:
            out.append(tokens[i] + tokens[i + 1])
            i += 2
        else:
            out.append(tokens[i])
            i += 1
    return out


def train(corpus: list[str], merges: int) -> list[tuple[bytes, bytes]]:
    words = [[bytes([b]) for b in text.encode("utf-8")] for text in corpus]
    rules: list[tuple[bytes, bytes]] = []
    previous_size = sum(map(len, words))
    for _ in range(merges):
        counts = pair_counts(words)
        if not counts:
            break
        # 频数优先；bytes 字典序作为确定性 tie-break。
        pair = min(counts, key=lambda p: (-counts[p], p))
        words = [merge_once(word, pair) for word in words]
        rules.append(pair)
        size = sum(map(len, words))
        assert size <= previous_size
        previous_size = size
        print(f"merge {pair!r}, frequency={counts[pair]}, tokens={size}")
    return rules


def encode(text: str, rules: list[tuple[bytes, bytes]]) -> list[bytes]:
    tokens = [bytes([b]) for b in text.encode("utf-8")]
    for pair in rules:  # 必须按训练得到的 rank 顺序重放。
        tokens = merge_once(tokens, pair)
    return tokens


def decode(tokens: list[bytes]) -> str:
    return b"".join(tokens).decode("utf-8")


def main() -> None:
    corpus = ["banana", "bandana", "你好，banana", "🙂 banana"]
    rules = train(corpus, merges=12)
    raw_bytes = sum(len(x.encode("utf-8")) for x in corpus)
    encoded = [encode(x, rules) for x in corpus]
    for text, tokens in zip(corpus, encoded):
        assert decode(tokens) == text
    token_count = sum(map(len, encoded))
    assert token_count <= raw_bytes
    print(f"bytes/token={raw_bytes / token_count:.3f}")
    print("PASS toy_bpe")


if __name__ == "__main__":
    main()
