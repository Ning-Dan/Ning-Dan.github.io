#!/usr/bin/env python3
"""不依赖框架的 patchify / unpatchify 与潜变量形状核对。"""


def patchify(image: list[list[int]], patch: int) -> list[list[int]]:
    height, width = len(image), len(image[0])
    assert height % patch == 0 and width % patch == 0
    tokens: list[list[int]] = []
    for top in range(0, height, patch):
        for left in range(0, width, patch):
            tokens.append(
                [image[row][col] for row in range(top, top + patch) for col in range(left, left + patch)]
            )
    return tokens


def unpatchify(tokens: list[list[int]], height: int, width: int, patch: int) -> list[list[int]]:
    image = [[0 for _ in range(width)] for _ in range(height)]
    token_index = 0
    for top in range(0, height, patch):
        for left in range(0, width, patch):
            values = tokens[token_index]
            token_index += 1
            value_index = 0
            for row in range(top, top + patch):
                for col in range(left, left + patch):
                    image[row][col] = values[value_index]
                    value_index += 1
    return image


def main() -> None:
    image = [[row * 8 + col for col in range(8)] for row in range(8)]
    tokens = patchify(image, patch=2)
    assert len(tokens) == (8 // 2) * (8 // 2) == 16
    assert all(len(token) == 2 * 2 for token in tokens)
    assert unpatchify(tokens, 8, 8, 2) == image

    raw_values = 3 * 256 * 256
    latent_values = 4 * 32 * 32
    compression_ratio = raw_values / latent_values
    assert compression_ratio == 48.0

    print("patchify: [1,8,8] -> 16 tokens, each token has 4 scalars")
    print(f"latent value-count ratio: [3,256,256] / [4,32,32] = {compression_ratio:.0f}x")
    print("PASS: patch layout is reversible and latent shape arithmetic is explicit")


if __name__ == "__main__":
    main()
