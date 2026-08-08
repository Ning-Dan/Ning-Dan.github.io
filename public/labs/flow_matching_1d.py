"""Train a tiny conditional velocity field and solve its ODE.

Run: python public/labs/flow_matching_1d.py
Standard library only.  Toy transport: epsilon~N(0,1), A=epsilon+2*c.
"""
from __future__ import annotations

import math
import random
from typing import Sequence


def features(x: float, tau: float, condition: float) -> tuple[float, ...]:
    return (x, tau, condition, 1.0)


def velocity(weights: Sequence[float], x: float, tau: float, condition: float) -> float:
    value = sum(w*f for w, f in zip(weights, features(x, tau, condition)))
    if not math.isfinite(value): raise ValueError("non-finite velocity")
    return value


def make_rows(seed: int, count: int) -> list[tuple[tuple[float, ...], float]]:
    rng = random.Random(seed); rows=[]
    for _ in range(count):
        condition = rng.choice((-1.0, 1.0)); noise = rng.gauss(0,1); data = noise+2*condition; tau=rng.random()
        x_tau = (1-tau)*noise + tau*data
        rows.append((features(x_tau,tau,condition), data-noise))
    return rows


def loss(weights: Sequence[float], rows: Sequence[tuple[tuple[float,...],float]]) -> float:
    return sum((sum(w*f for w,f in zip(weights,x))-y)**2 for x,y in rows)/len(rows)


def train(rows: Sequence[tuple[tuple[float,...],float]], steps: int=2500, lr: float=.05) -> list[float]:
    weights=[0.0]*4
    for _ in range(steps):
        grad=[0.0]*4
        for x,target in rows:
            error=sum(w*f for w,f in zip(weights,x))-target
            for j,f in enumerate(x): grad[j] += 2*error*f/len(rows)
        weights=[w-lr*g for w,g in zip(weights,grad)]
    return weights


def euler_solve(weights: Sequence[float], noise: float, condition: float, steps: int=20) -> float:
    if steps<=0: raise ValueError("positive steps required")
    x=noise; dt=1/steps
    for i in range(steps): x += dt*velocity(weights,x,i*dt,condition)
    return x


def reverse_convention(weights: Sequence[float], noise: float, condition: float, steps: int=20) -> float:
    """openpi-style time: t=1 noise -> t=0 data, both velocity and dt flip."""
    x=noise; dt=-1/steps
    for i in range(steps):
        tau=1-i/steps
        x += dt*(-velocity(weights,x,1-tau,condition))
    return x


def main() -> None:
    train_rows=make_rows(3,512); test_rows=make_rows(4,256)
    initial=loss([0]*4,test_rows); weights=train(train_rows); final=loss(weights,test_rows)
    assert final < 1e-8 and final < initial*1e-6
    assert abs(weights[2]-2)<1e-3
    probes=[(-.7,-1.0),(-.7,1.0),(.4,-1.0),(.4,1.0)]
    errors=[]
    for noise,condition in probes:
        expected=noise+2*condition
        forward=euler_solve(weights,noise,condition); reverse=reverse_convention(weights,noise,condition)
        errors += [abs(forward-expected),abs(reverse-expected)]
    assert max(errors)<1e-3
    wrong=-.7
    for i in range(20): wrong += .05*(-velocity(weights,wrong,i/20,1.0))
    assert abs(wrong-1.3)>1
    print("learned [x, tau, condition, bias] weights:",[round(w,4) for w in weights])
    print(f"held-out velocity MSE: {initial:.6f} -> {final:.10f}")
    print(f"forward/reverse max endpoint error: {max(errors):.8f}")
    print("wrong-sign endpoint:",round(wrong,4),"(expected 1.3)")
    print("conditional flow training + ODE solver: ALL CHECKS PASSED")


if __name__ == "__main__": main()
