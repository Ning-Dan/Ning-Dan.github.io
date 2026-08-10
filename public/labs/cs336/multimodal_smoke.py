"""独立教学实验：patch 数、CLIP/SigLIP loss、projector 与序列 mask。"""

from __future__ import annotations

import math


def patch_count(height: int, width: int, patch_size: int, merge: int = 1) -> int:
    assert height % patch_size == 0 and width % patch_size == 0
    assert merge > 0
    raw = (height // patch_size) * (width // patch_size)
    assert raw % (merge * merge) == 0
    return raw // (merge * merge)


def normalize(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector))
    assert norm > 0
    return [value / norm for value in vector]


def dot(left: list[float], right: list[float]) -> float:
    assert len(left) == len(right)
    return sum(a * b for a, b in zip(left, right))


def logsumexp(values: list[float]) -> float:
    maximum = max(values)
    return maximum + math.log(sum(math.exp(value - maximum) for value in values))


def cross_entropy_rows(logits: list[list[float]]) -> float:
    """第 i 行的正确类别固定为 i。"""
    losses = [logsumexp(row) - row[i] for i, row in enumerate(logits)]
    return sum(losses) / len(losses)


def similarity_matrix(
    image_embeddings: list[list[float]], text_embeddings: list[list[float]], temperature: float
) -> list[list[float]]:
    assert len(image_embeddings) == len(text_embeddings) and temperature > 0
    images = [normalize(vector) for vector in image_embeddings]
    texts = [normalize(vector) for vector in text_embeddings]
    return [[dot(image, text) / temperature for text in texts] for image in images]


def clip_loss(
    image_embeddings: list[list[float]], text_embeddings: list[list[float]], temperature: float = 0.1
) -> float:
    logits = similarity_matrix(image_embeddings, text_embeddings, temperature)
    transposed = [list(column) for column in zip(*logits)]
    return 0.5 * (cross_entropy_rows(logits) + cross_entropy_rows(transposed))


def softplus(value: float) -> float:
    return max(value, 0.0) + math.log1p(math.exp(-abs(value)))


def siglip_loss(
    image_embeddings: list[list[float]], text_embeddings: list[list[float]], temperature: float = 0.1
) -> float:
    logits = similarity_matrix(image_embeddings, text_embeddings, temperature)
    terms = []
    for i, row in enumerate(logits):
        for j, logit in enumerate(row):
            label = 1.0 if i == j else -1.0
            terms.append(softplus(-label * logit))
    return sum(terms) / len(terms)


def linear_project(features: list[list[float]], weight: list[list[float]]) -> list[list[float]]:
    assert features and weight and len(features[0]) == len(weight)
    output_dim = len(weight[0])
    assert all(len(row) == output_dim for row in weight)
    return [
        [sum(feature[k] * weight[k][j] for k in range(len(weight))) for j in range(output_dim)]
        for feature in features
    ]


def packed_masks(vision_tokens: int, prompt_tokens: int, answer_tokens: int):
    total = vision_tokens + prompt_tokens + answer_tokens
    causal = [[key <= query for key in range(total)] for query in range(total)]
    loss_mask = [0] * (vision_tokens + prompt_tokens) + [1] * answer_tokens
    return causal, loss_mask


def main() -> None:
    assert patch_count(336, 336, 14) == 576
    assert patch_count(672, 672, 14) == 4 * 576
    assert patch_count(336, 336, 14, merge=2) == 144

    images = [[1.0, 0.0], [0.0, 1.0]]
    aligned_texts = [[1.0, 0.0], [0.0, 1.0]]
    shuffled_texts = list(reversed(aligned_texts))
    aligned_clip = clip_loss(images, aligned_texts)
    shuffled_clip = clip_loss(images, shuffled_texts)
    aligned_siglip = siglip_loss(images, aligned_texts)
    shuffled_siglip = siglip_loss(images, shuffled_texts)
    assert aligned_clip < shuffled_clip
    assert aligned_siglip < shuffled_siglip

    features = [[1.0, 2.0, -1.0], [0.5, 0.0, 1.0]]
    projector = [
        [1.0, 0.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
    ]
    projected = linear_project(features, projector)
    assert len(projected) == 2 and all(len(token) == 4 for token in projected)

    causal, loss_mask = packed_masks(vision_tokens=2, prompt_tokens=3, answer_tokens=2)
    first_answer = 5
    assert all(causal[first_answer][vision_index] for vision_index in range(2))
    assert loss_mask == [0, 0, 0, 0, 0, 1, 1]

    print("patches: 336/14=576; 672/14=2304; 2x2 merge=144")
    print(f"CLIP aligned={aligned_clip:.6f}, shuffled={shuffled_clip:.6f}")
    print(f"SigLIP aligned={aligned_siglip:.6f}, shuffled={shuffled_siglip:.6f}")
    print(f"projected shape=({len(projected)}, {len(projected[0])}); loss mask={loss_mask}")
    print("PASS multimodal_smoke")


if __name__ == "__main__":
    main()
