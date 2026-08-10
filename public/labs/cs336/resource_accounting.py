"""独立教学实验：不用 GPU 也能核对 Transformer 的资源数量级。"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    batch: int = 8
    seq: int = 1024
    layers: int = 24
    d_model: int = 2048
    heads: int = 16
    vocab: int = 50_000


def account(c: Config) -> dict[str, int]:
    assert c.d_model % c.heads == 0
    # 每层：attention 的 Q,K,V,O 四个 d×d；SwiGLU 粗略按 3 d×d_ff，d_ff≈8d/3。
    d_ff = 8 * c.d_model // 3
    per_layer = 4 * c.d_model**2 + 3 * c.d_model * d_ff
    params = c.vocab * c.d_model + c.layers * per_layer
    # bf16 权重/梯度各2B，Adam m/v 各4B：每参数12B（未计 fp32 master weight）。
    static_bytes = params * 12
    attention_scores = c.batch * c.heads * c.seq * c.seq * c.layers
    residual_activations = c.batch * c.seq * c.d_model * c.layers
    return {
        "params": params,
        "static_bytes": static_bytes,
        "attention_scores": attention_scores,
        "residual_activations": residual_activations,
    }


def attainable_flops(peak: float, bandwidth: float, intensity: float) -> float:
    return min(peak, bandwidth * intensity)


def main() -> None:
    base = account(Config())
    twice = account(Config(seq=2048))
    assert twice["attention_scores"] == 4 * base["attention_scores"]
    assert twice["residual_activations"] == 2 * base["residual_activations"]
    peak, bw = 1_000e12, 3e12
    assert attainable_flops(peak, bw, 1) == 3e12  # memory-bound
    assert attainable_flops(peak, bw, 1_000) == peak  # compute-bound
    print(f"parameters={base['params'] / 1e9:.2f}B")
    print(f"static training state={base['static_bytes'] / 1e9:.1f}GB")
    print("PASS resource_accounting")


if __name__ == "__main__":
    main()
