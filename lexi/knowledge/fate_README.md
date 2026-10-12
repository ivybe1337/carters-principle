# FATE

This directory holds the FATE line of work — kept deliberately separate from the SSM/CSM/ARC
engineering track and from ECHO (the causal, competition-safe formalization of the same underlying
adjoint mechanism). See `FATE_Teleological_Framework.md` §0 for the full scope note on why these are
kept apart.

## Contents

- **FATE_Teleological_Framework.md** — the philosophical paper. Proposes, as an explicit interpretive
  axiom (not a proven mechanism), that eliminating impossible futures can be read as retrocausal:
  the surviving future as the reason the present is as it is. Grounded in real retrocausal physics
  and philosophy literature (Wheeler-Feynman, Cramer's transactional interpretation, Aharonov's
  two-state vector formalism, Novikov self-consistency) — genuinely speculative, but not invented
  from nothing.

- **FATE_Engine_Technical_Specification.md** — the working inference architecture built from the same
  elimination mechanism, described honestly as a new *combination* of established techniques
  (bidirectional constraint propagation / arc-consistency, forward-backward algorithm, adjoint/preimage
  methods), not a new mathematical principle. Includes a measured (small, toy-domain, honestly scoped)
  result showing real uncertainty reduction from combining forward generation with certified backward
  elimination.

- **fate_engine.py** — the actual implementation. `FateEngine` runs the forward pass, backward pass,
  intersection, certified nogood pruning, and fixed-point re-propagation described in the spec. Every
  elimination is logged with its exact cause (`FateResult.eliminations`), so any output is fully
  explainable — never a black-box score.

- **demo_arithmetic_trajectory.py** — a small, runnable, verified demo. Run
  `python demo_arithmetic_trajectory.py` to see forward-only ambiguity (which grows unbounded) versus
  FATE's bidirectional narrowing (which collapses it at every intermediate step, not just at the known
  ending) — with real numbers, not claims.

- **demo_grid_trajectory.py** — second demo, over a grid-transformation (ARC-style) state space,
  using an exact analytic inverse for every operation instead of brute-force search. Caught and fixed
  a real invertibility bug in the color-cycle operation while testing this (documented in the code and
  in the Technical Specification §3) rather than shipping it unverified.

## Status

Prototype v1, tested and working on the toy domain. Not yet benchmarked on any real-world task. See
the Technical Specification §5 for exactly what's proven, what's a working demo, and what's still
required before any larger claim is made.
