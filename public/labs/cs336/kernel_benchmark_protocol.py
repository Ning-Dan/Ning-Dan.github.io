"""独立教学实验：可信计时协议与 Triton kernel 的 CPU 资源账本。

本脚本不声称 CPU 数字能预测 GPU 加速比，也不实现 CS336 A2 的 TODO。
"""

from __future__ import annotations

import importlib.util
import math
import statistics
import time
from collections.abc import Callable


def ceil_div(numerator: int, denominator: int) -> int:
    assert numerator >= 0 and denominator > 0
    return (numerator + denominator - 1) // denominator


def block_accounting(num_elements: int, block_size: int) -> tuple[int, int]:
    programs = ceil_div(num_elements, block_size)
    launched_lanes = programs * block_size
    return programs, launched_lanes - num_elements


def register_limited_occupancy(
    threads_per_block: int,
    registers_per_thread: int,
    registers_per_sm: int = 65_536,
    max_warps_per_sm: int = 64,
) -> tuple[int, float]:
    """仅计算 register 这一项约束，不冒充完整 occupancy calculator。"""
    assert threads_per_block % 32 == 0
    registers_per_block = threads_per_block * registers_per_thread
    resident_blocks = registers_per_sm // registers_per_block
    resident_warps = resident_blocks * threads_per_block // 32
    occupancy = min(resident_warps / max_warps_per_sm, 1.0)
    return resident_blocks, occupancy


def pointwise_hbm_bytes(num_elements: int, stages: int, bytes_per_element: int = 4) -> int:
    """每阶段一次完整输入读和输出写的简化 HBM 账本。"""
    return stages * 2 * num_elements * bytes_per_element


def matmul_input_reads(n: int, tile_size: int | None = None) -> int:
    """方阵 matmul 的理想化输入元素读取次数，不含输出与 cache。"""
    if tile_size is None:
        return 2 * n**3
    assert n % tile_size == 0
    return 2 * n**3 // tile_size


def benchmark(
    operation: Callable[[], float], num_warmups: int = 3, num_trials: int = 15
) -> dict[str, float]:
    assert num_warmups >= 0 and num_trials >= 3
    for _ in range(num_warmups):
        operation()
    samples_ms: list[float] = []
    for _ in range(num_trials):
        start = time.perf_counter()
        operation()
        samples_ms.append((time.perf_counter() - start) * 1_000)
    ordered = sorted(samples_ms)
    p90_index = math.ceil(0.9 * len(ordered)) - 1
    return {
        "median_ms": statistics.median(ordered),
        "p90_ms": ordered[p90_index],
        "min_ms": ordered[0],
    }


def cpu_workload() -> float:
    # 固定而轻量的工作，只用于演示计时统计；不比较实现快慢。
    return sum(math.tanh(i / 1000) for i in range(2_000))


def main() -> None:
    assert block_accounting(1_000, 1_024) == (1, 24)
    assert block_accounting(1_025, 1_024) == (2, 1_023)
    assert block_accounting(1_024, 1_024) == (1, 0)

    blocks, occupancy = register_limited_occupancy(128, 160)
    assert blocks == 3
    assert abs(occupancy - 12 / 64) < 1e-12

    elements = 1_000_000
    eager_traffic = pointwise_hbm_bytes(elements, stages=5)
    fused_traffic = pointwise_hbm_bytes(elements, stages=1)
    assert eager_traffic == 5 * fused_traffic

    assert matmul_input_reads(1_024, tile_size=64) * 64 == matmul_input_reads(1_024)

    timing = benchmark(cpu_workload)
    assert 0 < timing["min_ms"] <= timing["median_ms"] <= timing["p90_ms"]

    torch_available = importlib.util.find_spec("torch") is not None
    triton_available = importlib.util.find_spec("triton") is not None
    print(f"register-only resident blocks={blocks}; occupancy={occupancy:.1%}")
    print(f"five-stage/fused HBM traffic ratio={eager_traffic / fused_traffic:.1f}x")
    print("CPU timing protocol:", {key: round(value, 4) for key, value in timing.items()})
    print(f"optional stack: torch={torch_available}, triton={triton_available}")
    print("PASS kernel_benchmark_protocol")


if __name__ == "__main__":
    main()
