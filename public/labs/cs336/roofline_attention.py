"""独立教学实验：区分 FLOPs、HBM traffic，并验证 online softmax。"""

import math


def roofline(peak_flops: float, bandwidth: float, flops: float, moved_bytes: float):
    intensity = flops / moved_bytes
    attainable = min(peak_flops, bandwidth * intensity)
    bound = "memory" if bandwidth * intensity < peak_flops else "compute"
    return intensity, attainable, bound


def attention_storage(seq: int, tile_q: int, tile_k: int) -> tuple[int, int]:
    full_scores = seq * seq
    tile_scores = min(seq, tile_q) * min(seq, tile_k)
    return full_scores, tile_scores


def score_hbm_bytes(seq: int, bytes_per_element: int = 2, materialize: bool = True) -> int:
    """只计算 score 矩阵写入、随后读回的 HBM traffic。"""
    if not materialize:
        return 0
    return 2 * seq * seq * bytes_per_element


def stable_weighted_sum(scores: list[float], values: list[float]) -> float:
    maximum = max(scores)
    weights = [math.exp(score - maximum) for score in scores]
    return sum(weight * value for weight, value in zip(weights, values)) / sum(weights)


def online_weighted_sum(scores: list[float], values: list[float], block_size: int) -> float:
    """分块维护 max、指数和与未归一化输出；不保存完整 softmax。"""
    assert len(scores) == len(values) and scores and block_size > 0
    maximum = -math.inf
    normalizer = 0.0
    accumulator = 0.0
    for start in range(0, len(scores), block_size):
        score_block = scores[start : start + block_size]
        value_block = values[start : start + block_size]
        new_maximum = max(maximum, max(score_block))
        old_scale = 0.0 if maximum == -math.inf else math.exp(maximum - new_maximum)
        block_weights = [math.exp(score - new_maximum) for score in score_block]
        normalizer = old_scale * normalizer + sum(block_weights)
        accumulator = old_scale * accumulator + sum(
            weight * value for weight, value in zip(block_weights, value_block)
        )
        maximum = new_maximum
    return accumulator / normalizer


def main() -> None:
    peak, bw = 1_000e12, 3e12
    _, _, elementwise_bound = roofline(peak, bw, flops=10e6, moved_bytes=40e6)
    _, _, matmul_bound = roofline(peak, bw, flops=2e12, moved_bytes=2e9)
    assert elementwise_bound == "memory"
    assert matmul_bound == "compute"
    full, tile = attention_storage(seq=4096, tile_q=128, tile_k=128)
    assert tile < full
    assert attention_storage(8192, 128, 128)[0] == 4 * full
    naive_traffic = score_hbm_bytes(4096)
    streaming_score_traffic = score_hbm_bytes(4096, materialize=False)
    assert score_hbm_bytes(8192) == 4 * naive_traffic
    assert streaming_score_traffic == 0

    # 1000 量级 logits 会让直接 exp 溢出；稳定版与分块递推应一致。
    scores = [1000.0, 999.0, -1000.0, 1002.0, 998.0]
    values = [1.0, -2.0, 50.0, 4.0, 0.5]
    reference = stable_weighted_sum(scores, values)
    for block_size in (1, 2, 3, 8):
        actual = online_weighted_sum(scores, values, block_size)
        assert abs(actual - reference) < 1e-12

    print(f"full score elements={full:,}; one tile={tile:,}")
    print(f"materialized score HBM traffic={naive_traffic / 2**20:.1f} MiB; streaming score traffic=0")
    print(f"stable/online weighted output={reference:.8f}")
    print("注意：traffic 只统计 score 写读；这是 I/O 账本，不是 GPU 速度测试。")
    print("PASS roofline_attention")


if __name__ == "__main__":
    main()
