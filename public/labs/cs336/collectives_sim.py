"""独立教学实验：在单进程中模拟 collective 的数学语义。"""


def all_reduce_sum(ranks: list[list[float]]) -> list[list[float]]:
    total = [sum(values) for values in zip(*ranks)]
    return [total[:] for _ in ranks]


def reduce_scatter_sum(ranks: list[list[float]]) -> list[list[float]]:
    total = all_reduce_sum(ranks)[0]
    assert len(total) % len(ranks) == 0
    width = len(total) // len(ranks)
    return [total[r * width : (r + 1) * width] for r in range(len(ranks))]


def all_gather(shards: list[list[float]]) -> list[list[float]]:
    joined = [value for shard in shards for value in shard]
    return [joined[:] for _ in shards]


def main() -> None:
    ranks = [[float(r + i) for i in range(4)] for r in range(4)]
    reduced = all_reduce_sum(ranks)
    shards = reduce_scatter_sum(ranks)
    gathered = all_gather(shards)
    assert reduced == gathered
    assert shards == [[6.0], [10.0], [14.0], [18.0]]
    assert all(len(shard) == 1 for shard in shards)
    print("rank inputs:", ranks)
    print("reduce-scatter:", shards)
    print("PASS collectives_sim")


if __name__ == "__main__":
    main()
