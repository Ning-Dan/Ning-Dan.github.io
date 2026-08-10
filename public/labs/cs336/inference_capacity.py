"""独立教学实验：KV cache 容量与请求级 continuous batching。"""

from dataclasses import dataclass


def kv_bytes(batch: int, seq: int, kv_heads: int, head_dim: int, layers: int, bytes_per: int = 2) -> int:
    return 2 * batch * seq * kv_heads * head_dim * layers * bytes_per


@dataclass(frozen=True)
class Request:
    request_id: str
    arrival: int
    output_tokens: int


@dataclass(frozen=True)
class Simulation:
    elapsed_steps: int
    busy_slot_steps: int
    reserved_slot_steps: int
    completion: dict[str, int]

    @property
    def utilization(self) -> float:
        return self.busy_slot_steps / self.reserved_slot_steps


def simulate_static_batches(requests: list[Request], capacity: int) -> Simulation:
    """固定 batch 完成前不补入新请求；短请求的 slot 留空到最长请求结束。"""
    assert capacity > 0 and all(request.output_tokens > 0 for request in requests)
    pending = sorted(requests, key=lambda request: (request.arrival, request.request_id))
    time_step = 0
    busy = 0
    reserved = 0
    completion: dict[str, int] = {}
    while pending:
        if pending[0].arrival > time_step:
            time_step = pending[0].arrival
        available = [request for request in pending if request.arrival <= time_step]
        batch = available[:capacity]
        for request in batch:
            pending.remove(request)
        duration = max(request.output_tokens for request in batch)
        busy += sum(request.output_tokens for request in batch)
        reserved += capacity * duration
        for request in batch:
            completion[request.request_id] = time_step + request.output_tokens
        time_step += duration
    return Simulation(time_step, busy, reserved, completion)


def simulate_continuous_batching(requests: list[Request], capacity: int) -> Simulation:
    """每个 decode tick 后移除完成请求，并立即用已到达请求填补 slot。"""
    assert capacity > 0 and all(request.output_tokens > 0 for request in requests)
    unseen = sorted(requests, key=lambda request: (request.arrival, request.request_id))
    waiting: list[Request] = []
    active: dict[str, tuple[Request, int]] = {}
    completion: dict[str, int] = {}
    time_step = 0
    busy = 0
    reserved = 0

    while unseen or waiting or active:
        if not active and not waiting and unseen and unseen[0].arrival > time_step:
            time_step = unseen[0].arrival
        while unseen and unseen[0].arrival <= time_step:
            waiting.append(unseen.pop(0))
        while waiting and len(active) < capacity:
            request = waiting.pop(0)
            active[request.request_id] = (request, request.output_tokens)

        reserved += capacity
        busy += len(active)
        finished: list[str] = []
        for request_id, (request, remaining) in active.items():
            remaining -= 1
            active[request_id] = (request, remaining)
            if remaining == 0:
                finished.append(request_id)
        time_step += 1
        for request_id in finished:
            completion[request_id] = time_step
            del active[request_id]

    return Simulation(time_step, busy, reserved, completion)


def main() -> None:
    mha = kv_bytes(batch=16, seq=4096, kv_heads=32, head_dim=128, layers=32)
    gqa = kv_bytes(batch=16, seq=4096, kv_heads=8, head_dim=128, layers=32)
    assert gqa * 4 == mha
    requests = [
        Request("A", arrival=0, output_tokens=4),
        Request("B", arrival=0, output_tokens=1),
        Request("C", arrival=1, output_tokens=2),
        Request("D", arrival=2, output_tokens=1),
        Request("E", arrival=3, output_tokens=3),
    ]
    static = simulate_static_batches(requests, capacity=2)
    continuous = simulate_continuous_batching(requests, capacity=2)
    total_tokens = sum(request.output_tokens for request in requests)
    assert static.busy_slot_steps == continuous.busy_slot_steps == total_tokens
    assert continuous.elapsed_steps < static.elapsed_steps
    assert continuous.utilization > static.utilization
    assert continuous.completion["C"] < static.completion["C"]
    print(f"MHA KV={mha / 2**30:.2f} GiB; GQA KV={gqa / 2**30:.2f} GiB")
    print(
        f"static elapsed={static.elapsed_steps}, utilization={static.utilization:.1%}, "
        f"completion={static.completion}"
    )
    print(
        f"continuous elapsed={continuous.elapsed_steps}, utilization={continuous.utilization:.1%}, "
        f"completion={continuous.completion}"
    )
    print("PASS inference_capacity")


if __name__ == "__main__":
    main()
