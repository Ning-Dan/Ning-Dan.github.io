"""Two self-consistent 1D flow-matching time conventions.

Run: python3 flow_matching_1d.py
Dependencies: Python 3.10+ standard library only.
"""

from __future__ import annotations


def euler_noise_to_data(noise: float, data: float, steps: int = 10) -> float:
    """Course convention: tau=0 noise, tau=1 data, v=data-noise."""
    if steps <= 0:
        raise ValueError("steps must be positive")
    x = noise
    dt = 1.0 / steps
    velocity = data - noise
    for _ in range(steps):
        x += dt * velocity
    return x


def euler_openpi_convention(noise: float, data: float, steps: int = 10) -> float:
    """openpi convention: t=1 noise, t=0 data, u=noise-data, dt<0."""
    if steps <= 0:
        raise ValueError("steps must be positive")
    x = noise
    dt = -1.0 / steps
    velocity = noise - data
    for _ in range(steps):
        x += dt * velocity
    return x


def smoke_test() -> None:
    noise, data = -1.0, 2.0
    course = euler_noise_to_data(noise, data)
    openpi = euler_openpi_convention(noise, data)
    assert abs(course - data) < 1e-12, course
    assert abs(openpi - data) < 1e-12, openpi

    wrong = noise
    for _ in range(10):
        wrong += 0.1 * (noise - data)
    assert abs(wrong - data) > 1.0, wrong

    print(f"course convention endpoint: {course:.6f}")
    print(f"openpi convention endpoint: {openpi:.6f}")
    print("flow direction smoke test: PASS")


if __name__ == "__main__":
    smoke_test()
