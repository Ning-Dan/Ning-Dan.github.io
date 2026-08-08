"""Train and sample a tiny 1D multimodal DDPM with no third-party packages.

The expert action distribution has two valid modes near -2 and +2.  A scalar
MSE regressor predicts their unsafe average near zero; a learned diffusion
model should sample both modes.

This is a mechanism test, not a robot-policy benchmark.
Run: python public/labs/diffusion_multimodal_1d.py
"""

from __future__ import annotations

from dataclasses import dataclass
from math import cos, exp, isfinite, pi, sin, sqrt, tanh
import random


def make_schedule(steps: int = 24) -> tuple[list[float], list[float], list[float]]:
    betas = [0.015 + (0.12 - 0.015) * index / (steps - 1) for index in range(steps)]
    alphas = [1.0 - beta for beta in betas]
    alpha_bars: list[float] = []
    product = 1.0
    for alpha in alphas:
        product *= alpha
        alpha_bars.append(product)
    return betas, alphas, alpha_bars


def sample_expert(rng: random.Random) -> float:
    mode = -2.0 if rng.random() < 0.5 else 2.0
    return mode + rng.gauss(0.0, 0.12)


def features(noisy_action: float, step: int, total_steps: int) -> tuple[float, ...]:
    tau = step / max(1, total_steps - 1)
    return noisy_action / 3.0, tau, sin(pi * tau), cos(pi * tau)


@dataclass
class AdamState:
    mean: list[float]
    variance: list[float]


class TinyDenoiser:
    def __init__(self, rng: random.Random, hidden: int = 32) -> None:
        self.hidden = hidden
        self.width = 4
        self.w1 = [rng.gauss(0.0, 0.25) for _ in range(hidden * self.width)]
        self.b1 = [0.0 for _ in range(hidden)]
        self.w2 = [rng.gauss(0.0, 0.2) for _ in range(hidden)]
        self.b2 = [0.0]
        self.states = {
            "w1": AdamState([0.0] * len(self.w1), [0.0] * len(self.w1)),
            "b1": AdamState([0.0] * len(self.b1), [0.0] * len(self.b1)),
            "w2": AdamState([0.0] * len(self.w2), [0.0] * len(self.w2)),
            "b2": AdamState([0.0], [0.0]),
        }

    def forward(self, inputs: tuple[float, ...]) -> tuple[float, list[float]]:
        hidden_values = []
        for row in range(self.hidden):
            offset = row * self.width
            value = self.b1[row] + sum(self.w1[offset + col] * inputs[col] for col in range(self.width))
            hidden_values.append(tanh(value))
        prediction = self.b2[0] + sum(weight * value for weight, value in zip(self.w2, hidden_values))
        return prediction, hidden_values

    @staticmethod
    def _adam_update(
        parameters: list[float], gradients: list[float], state: AdamState, iteration: int, learning_rate: float
    ) -> None:
        beta1, beta2, epsilon = 0.9, 0.999, 1e-8
        correction1 = 1.0 - beta1 ** iteration
        correction2 = 1.0 - beta2 ** iteration
        for index, gradient in enumerate(gradients):
            state.mean[index] = beta1 * state.mean[index] + (1.0 - beta1) * gradient
            state.variance[index] = beta2 * state.variance[index] + (1.0 - beta2) * gradient * gradient
            mean_hat = state.mean[index] / correction1
            variance_hat = state.variance[index] / correction2
            parameters[index] -= learning_rate * mean_hat / (sqrt(variance_hat) + epsilon)

    def train_batch(
        self,
        batch: list[tuple[tuple[float, ...], float]],
        iteration: int,
        learning_rate: float = 0.003,
    ) -> float:
        grad_w1 = [0.0] * len(self.w1)
        grad_b1 = [0.0] * len(self.b1)
        grad_w2 = [0.0] * len(self.w2)
        grad_b2 = [0.0]
        loss = 0.0
        scale = 1.0 / len(batch)

        for inputs, target_noise in batch:
            prediction, hidden_values = self.forward(inputs)
            error = prediction - target_noise
            loss += error * error * scale
            grad_prediction = 2.0 * error * scale
            old_w2 = list(self.w2)
            grad_b2[0] += grad_prediction
            for row, hidden_value in enumerate(hidden_values):
                grad_w2[row] += grad_prediction * hidden_value
                grad_hidden = grad_prediction * old_w2[row] * (1.0 - hidden_value * hidden_value)
                grad_b1[row] += grad_hidden
                offset = row * self.width
                for col in range(self.width):
                    grad_w1[offset + col] += grad_hidden * inputs[col]

        for name, parameters, gradients in (
            ("w1", self.w1, grad_w1),
            ("b1", self.b1, grad_b1),
            ("w2", self.w2, grad_w2),
            ("b2", self.b2, grad_b2),
        ):
            self._adam_update(parameters, gradients, self.states[name], iteration, learning_rate)
        return loss


def train(seed: int = 17, iterations: int = 4500, batch_size: int = 64) -> tuple[TinyDenoiser, list[float]]:
    rng = random.Random(seed)
    _, _, alpha_bars = make_schedule()
    model = TinyDenoiser(rng)
    checkpoints: list[float] = []
    for iteration in range(1, iterations + 1):
        batch = []
        for _ in range(batch_size):
            clean_action = sample_expert(rng)
            step = rng.randrange(len(alpha_bars))
            noise = rng.gauss(0.0, 1.0)
            alpha_bar = alpha_bars[step]
            noisy_action = sqrt(alpha_bar) * clean_action + sqrt(1.0 - alpha_bar) * noise
            batch.append((features(noisy_action, step, len(alpha_bars)), noise))
        loss = model.train_batch(batch, iteration)
        if iteration in (1, 500, 1500, iterations):
            checkpoints.append(loss)
    return model, checkpoints


def sample(model: TinyDenoiser, rng: random.Random, count: int = 400) -> list[float]:
    betas, alphas, alpha_bars = make_schedule()
    samples = []
    for _ in range(count):
        action = rng.gauss(0.0, 1.0)
        for step in range(len(betas) - 1, -1, -1):
            predicted_noise, _ = model.forward(features(action, step, len(betas)))
            mean = (action - betas[step] * predicted_noise / sqrt(1.0 - alpha_bars[step])) / sqrt(alphas[step])
            if step > 0:
                previous_bar = alpha_bars[step - 1]
                posterior_variance = betas[step] * (1.0 - previous_bar) / (1.0 - alpha_bars[step])
                action = mean + sqrt(max(0.0, posterior_variance)) * rng.gauss(0.0, 1.0)
            else:
                action = mean
        samples.append(action)
    return samples


def smoke_test() -> None:
    model, losses = train()
    samples = sample(model, random.Random(23))
    negative = sum(value < -0.8 for value in samples)
    positive = sum(value > 0.8 for value in samples)
    central = sum(abs(value) < 0.6 for value in samples)
    finite = all(isfinite(value) for value in samples)
    expert_mean = sum(sample_expert(random.Random(index)) for index in range(1000)) / 1000.0

    assert finite
    assert negative > len(samples) * 0.20, negative
    assert positive > len(samples) * 0.20, positive
    assert central < len(samples) * 0.30, central
    assert abs(expert_mean) < 0.25, expert_mean

    ordered = sorted(samples)
    quantiles = [ordered[int((len(ordered) - 1) * q)] for q in (0.1, 0.5, 0.9)]
    print("training MSE checkpoints:", [round(value, 4) for value in losses])
    print(f"single-MSE baseline (expert mean): {expert_mean:.4f}")
    print("sample q10/q50/q90:", [round(value, 3) for value in quantiles])
    print(f"mode counts: negative={negative}, central={central}, positive={positive}, total={len(samples)}")
    print("PASS: the trained denoiser samples both expert modes instead of only their mean")
    print("BOUNDARY: this 1D test does not establish image conditioning, trajectory quality, or robot success")


if __name__ == "__main__":
    smoke_test()
