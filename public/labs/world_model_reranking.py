"""Finite VLA-candidate reranking and an OOD optimizer-exploitation demo.

Run: python public/labs/world_model_reranking.py
Standard library only.  The world-model ensemble is hand-designed, not trained.
"""
from __future__ import annotations

import math
import statistics
from itertools import product
from typing import Sequence


Chunk = tuple[float, ...]


def true_rollout(state: float, chunk: Sequence[float]) -> float:
    for action in chunk: state += action
    return state


def learned_step(state: float, action: float, cubic: float) -> float:
    # Accurate in the demonstration region |a|<=0.6, pathological far outside.
    correction = 0.0 if abs(action) <= 0.6 else cubic * action**3
    return state + action - correction


def ensemble_rollout(state: float, chunk: Sequence[float]) -> list[float]:
    predictions=[]
    for cubic in (0.20, 0.25, 0.30):
        x=state
        for action in chunk: x=learned_step(x, action, cubic)
        predictions.append(x)
    return predictions


def task_cost(final_state: float, chunk: Sequence[float], goal: float=1.0) -> float:
    return (final_state-goal)**2 + 0.02*sum(action**2 for action in chunk)


def model_score(chunk: Chunk, uncertainty_weight: float=2.0) -> tuple[float,float,float]:
    predictions=ensemble_rollout(0.0,chunk)
    mean=statistics.fmean(predictions); variance=statistics.pvariance(predictions)
    return task_cost(mean,chunk)+uncertainty_weight*variance, mean, variance


def main() -> None:
    # Think of these as diverse chunks proposed by a VLA, not arbitrary optimizer variables.
    candidates: list[Chunk]=[(.2,.3,.5),(.4,.4,.4),(.1,.2,.3),(-.2,.3,.4)]
    ranked=sorted((model_score(chunk)[0],chunk,model_score(chunk)) for chunk in candidates)
    _,chosen,(score,predicted,uncertainty)=ranked[0]
    true_final=true_rollout(0,chosen)
    assert chosen==(.2,.3,.5) and abs(predicted-1)<1e-12 and abs(true_final-1)<1e-12
    assert uncertainty==0

    # An unrestricted optimizer searches well outside the data-supported action range.
    grid=[-4+i*.001 for i in range(8001)]
    # Deliberately optimize only one ensemble member's predicted terminal error,
    # with no action prior or uncertainty penalty: an unsafe anti-pattern.
    exploited=min((((ensemble_rollout(0,(a,a,a))[1]-1.0)**2,a) for a in grid))[1]
    exploit_chunk=(exploited,)*3
    model_final=ensemble_rollout(0,exploit_chunk)[1]; real_final=true_rollout(0,exploit_chunk)
    exploit_uncertainty=statistics.pvariance(ensemble_rollout(0,exploit_chunk))
    assert abs(exploited)>.6 and abs(model_final-1)<.25 and abs(real_final-1)>2
    assert exploit_uncertainty>.1

    # Report reward/value boundaries explicitly: reward is per-step, value is a prediction.
    rewards=[-.02*a*a for a in chosen]
    terminal_reward=-(true_final-1)**2
    value_estimate=-(predicted-1)**2
    assert all(math.isfinite(x) for x in rewards+[terminal_reward,value_estimate])
    print("finite candidate ranking:")
    for total,chunk,(_,mean,var) in ranked: print(f"  {chunk}: score={total:.4f}, predicted_final={mean:.3f}, uncertainty={var:.4f}")
    print(f"chosen={chosen}; predicted/true final={predicted:.3f}/{true_final:.3f}")
    print(f"unrestricted exploit action={exploited:.2f}; model/true final={model_final:.3f}/{real_final:.3f}; uncertainty={exploit_uncertainty:.3f}")
    print(f"step rewards={rewards}; terminal_reward={terminal_reward:.3f}; value_estimate={value_estimate:.3f}")
    print("finite candidate reranking + OOD exploitation: ALL CHECKS PASSED")


if __name__ == "__main__": main()
