#!/usr/bin/env python3
"""Lab 3 对齐 smoke test：CFG、DiT 部件、VAE 与 latent CFM。"""

from __future__ import annotations

import math

import numpy as np


def label_dropout(labels, drop_probability, null_label, rng):
    dropped = rng.random(len(labels)) < drop_probability
    result = labels.copy()
    result[dropped] = null_label
    return result, dropped


def fourier_encode(t, embedding_dim=16):
    assert embedding_dim % 2 == 0
    frequencies = 2.0 ** np.arange(embedding_dim // 2)
    angles = 2.0 * math.pi * np.asarray(t)[:, None] * frequencies[None, :]
    return np.concatenate([np.sin(angles), np.cos(angles)], axis=1)


def patchify(images, patch_size):
    batch, channels, height, width = images.shape
    assert height % patch_size == 0 and width % patch_size == 0
    grid_h, grid_w = height // patch_size, width // patch_size
    patches = images.reshape(batch, channels, grid_h, patch_size, grid_w, patch_size)
    patches = patches.transpose(0, 2, 4, 1, 3, 5)
    return patches.reshape(batch, grid_h * grid_w, channels * patch_size**2)


def depatchify(tokens, channels, height, width, patch_size):
    batch = tokens.shape[0]
    grid_h, grid_w = height // patch_size, width // patch_size
    patches = tokens.reshape(batch, grid_h, grid_w, channels, patch_size, patch_size)
    images = patches.transpose(0, 3, 1, 4, 2, 5)
    return images.reshape(batch, channels, height, width)


def softmax(x, axis=-1):
    shifted = x - np.max(x, axis=axis, keepdims=True)
    exp = np.exp(shifted)
    return exp / np.sum(exp, axis=axis, keepdims=True)


def attention(q, k, v):
    weights = softmax(q @ k.swapaxes(-1, -2) / math.sqrt(q.shape[-1]), axis=-1)
    return weights @ v, weights


def multihead_attention(x, heads, rng):
    """完成 Q/K/V 投影、分头、注意力、拼接和输出投影。"""
    batch, tokens, hidden = x.shape
    assert hidden % heads == 0
    head_dim = hidden // heads

    def project():
        weight = rng.normal(scale=1.0 / math.sqrt(hidden), size=(hidden, hidden))
        value = x @ weight
        return value.reshape(batch, tokens, heads, head_dim).transpose(0, 2, 1, 3)

    q, k, v = project(), project(), project()
    attended, weights = attention(q, k, v)
    merged = attended.transpose(0, 2, 1, 3).reshape(batch, tokens, hidden)
    output_weight = rng.normal(scale=1.0 / math.sqrt(hidden), size=(hidden, hidden))
    return merged @ output_weight, weights


def layer_norm(x, eps=1e-5):
    return (x - x.mean(axis=-1, keepdims=True)) / np.sqrt(x.var(axis=-1, keepdims=True) + eps)


def adaln_gated_dit_forward(tokens, condition, rng, zero_gates=False):
    """单个简化 DiT block；用 shape 与 zero-gate identity 检查数据流。"""
    batch, _, hidden = tokens.shape
    modulation = condition @ rng.normal(scale=0.1, size=(condition.shape[-1], 6 * hidden))
    shift_a, scale_a, gate_a, shift_m, scale_m, gate_m = np.split(modulation, 6, axis=-1)
    if zero_gates:
        gate_a = np.zeros_like(gate_a)
        gate_m = np.zeros_like(gate_m)

    normalized = layer_norm(tokens) * (1.0 + scale_a[:, None, :]) + shift_a[:, None, :]
    attended, _ = multihead_attention(normalized, heads=3, rng=rng)
    x = tokens + gate_a[:, None, :] * attended

    normalized_mlp = layer_norm(x) * (1.0 + scale_m[:, None, :]) + shift_m[:, None, :]
    hidden_mlp = np.tanh(normalized_mlp @ rng.normal(scale=0.15, size=(hidden, 2 * hidden)))
    projected = hidden_mlp @ rng.normal(scale=0.15, size=(2 * hidden, hidden))
    return x + gate_m[:, None, :] * projected


def vae_checks(rng):
    batch, latent_dim = 128, 6
    mu = rng.normal(scale=0.4, size=(batch, latent_dim))
    logvar = rng.normal(loc=-0.3, scale=0.2, size=(batch, latent_dim))
    epsilon = rng.normal(size=mu.shape)
    latent = mu + np.exp(0.5 * logvar) * epsilon
    kl_per_item = -0.5 * np.sum(1.0 + logvar - mu**2 - np.exp(logvar), axis=1)

    decoder = rng.normal(scale=0.2, size=(latent_dim, 12))
    reconstruction = latent @ decoder
    target = rng.normal(size=reconstruction.shape)
    recon_mse = float(np.mean((reconstruction - target) ** 2))
    assert latent.shape == mu.shape
    assert np.all(kl_per_item >= 0.0)
    assert math.isfinite(recon_mse)
    return float(kl_per_item.mean()), recon_mse


def latent_cfm_one_step(rng):
    batch, latent_dim = 512, 5
    source = rng.normal(size=(batch, latent_dim))
    target = 0.6 * rng.normal(size=(batch, latent_dim)) + 1.0
    t = rng.uniform(size=(batch, 1))
    xt = (1.0 - t) * source + t * target
    features = np.concatenate([xt, t, np.ones_like(t)], axis=1)
    velocity = target - source
    weights = np.zeros((features.shape[1], latent_dim))

    def loss(current):
        return float(np.mean((features @ current - velocity) ** 2))

    before = loss(weights)
    gradient = 2.0 * features.T @ (features @ weights - velocity) / (batch * latent_dim)
    lipschitz = 2.0 * np.linalg.norm(features, 2) ** 2 / (batch * latent_dim)
    weights -= (0.8 / lipschitz) * gradient
    after = loss(weights)
    assert after < before
    return before, after


def main():
    rng = np.random.default_rng(336)
    labels = np.arange(10_000) % 10
    dropped_labels, dropped = label_dropout(labels, 0.2, 10, rng)
    drop_rate = float(dropped.mean())
    assert 0.18 < drop_rate < 0.22
    assert np.all(dropped_labels[dropped] == 10)

    time_embedding = fourier_encode(np.array([0.0, 0.25, 0.9]), 16)
    assert time_embedding.shape == (3, 16)

    images = rng.normal(size=(2, 3, 8, 8))
    tokens = patchify(images, 2)
    restored = depatchify(tokens, 3, 8, 8, 2)
    assert tokens.shape == (2, 16, 12)
    assert np.array_equal(restored, images)

    attention_input = rng.normal(size=(2, 6, 12))
    attended, weights = multihead_attention(attention_input, heads=3, rng=rng)
    assert attended.shape == attention_input.shape
    assert np.allclose(weights.sum(axis=-1), 1.0)

    dit_tokens = rng.normal(size=(2, 16, 12))
    condition = rng.normal(size=(2, 8))
    identity = adaln_gated_dit_forward(dit_tokens, condition, np.random.default_rng(9), zero_gates=True)
    transformed = adaln_gated_dit_forward(dit_tokens, condition, np.random.default_rng(9), zero_gates=False)
    assert np.allclose(identity, dit_tokens)
    assert transformed.shape == dit_tokens.shape
    assert not np.allclose(transformed, dit_tokens)

    kl, recon = vae_checks(rng)
    cfm_before, cfm_after = latent_cfm_one_step(rng)
    print(f"Label dropout: observed={drop_rate:.3f}, expected=0.200")
    print(f"Shapes: Fourier={time_embedding.shape}, patches={tokens.shape}, attention={attended.shape}")
    print(f"VAE: mean KL={kl:.4f}, reconstruction MSE={recon:.4f}")
    print(f"Latent CFM one-step MSE: {cfm_before:.4f} -> {cfm_after:.4f}")
    print("PASS: Lab 3 CFG/Fourier/patch/attention/AdaLN-DiT/VAE/latent-CFM")


if __name__ == "__main__":
    main()
