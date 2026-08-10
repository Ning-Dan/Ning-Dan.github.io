"""独立教学实验：纯标准库手算 causal attention 与 next-token NLL。"""

import math


def dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def softmax(xs: list[float]) -> list[float]:
    m = max(xs)
    exps = [math.exp(x - m) for x in xs]
    total = sum(exps)
    return [x / total for x in exps]


def causal_attention(q: list[list[float]], k: list[list[float]], v: list[list[float]]):
    d = len(q[0])
    weights, outputs = [], []
    for i, qi in enumerate(q):
        allowed = [dot(qi, k[j]) / math.sqrt(d) for j in range(i + 1)]
        row = softmax(allowed) + [0.0] * (len(q) - i - 1)
        weights.append(row)
        outputs.append([sum(row[j] * v[j][h] for j in range(len(v))) for h in range(len(v[0]))])
    return weights, outputs


def main() -> None:
    q = [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]
    k = [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]
    v = [[1.0, 0.0], [0.0, 2.0], [3.0, 3.0]]
    weights, outputs = causal_attention(q, k, v)
    assert all(abs(sum(row) - 1.0) < 1e-12 for row in weights)
    assert weights[0][1:] == [0.0, 0.0] and weights[1][2] == 0.0
    assert outputs[0] == v[0]
    vocab = 5
    uniform_nll = -math.log(1 / vocab)
    assert abs(uniform_nll - math.log(vocab)) < 1e-12
    print("attention weights:", weights)
    print(f"uniform NLL for V={vocab}: {uniform_nll:.4f}")
    print("PASS causal_lm_math")


if __name__ == "__main__":
    main()
