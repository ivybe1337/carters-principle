# FATE Engine: A Bidirectional Elimination-Based Inference Architecture

**Author:** Joshua Matthew Carter
**Affiliation:** NeverZero
**Status:** Working prototype (v2). Core algorithm implemented and tested against two independent
domains: `demo_arithmetic_trajectory.py` (brute-force inverse) and `demo_grid_trajectory.py`
(exact analytic inverse over a grid-transformation / ARC-style state space -- closes the §5
brute-force limitation from v1). Both demos were run and debugged live: v2's color-cycle operation
had a genuine invertibility bug (color 3 wrapped onto the reserved background value 0, silently
breaking the exact inverse) caught by actually running the demo and checking round-trip equality,
not by assuming the math was correct -- fixed by cycling only foreground colors. Larger/learned-model
integration remains future work (see §5).

> **Patent Pending** (Docket RAD-PROV-2026-001, where applicable to overlapping claims). Written
> content licensed [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Code is
> provided for evaluation; commercial use requires separate arrangement with the author.

---

## 1. The gap this fills

Almost all current sequence-prediction architectures — autoregressive transformers, RNNs, standard
world models — are **one-directional**: they propose what comes next given what came before, and
stop there. When the transition process is ambiguous (multiple valid next states), that ambiguity
compounds forward, unresolved, for the entire horizon. If you already have information about a later
state — a known ending, an observed later frame, a stated goal, a hypothesis to test — a one-directional
model has no native way to use it to resolve *earlier* ambiguity. It can only check candidates against
the ending after generating them, discarding mismatches after the fact rather than never generating
them in the first place.

**FATE Engine's contribution is combining a forward generative/proposal mechanism with a certified
backward necessity pass, intersected at every time step, iterated to a fixed point.** This is not a new
fundamental principle of computation — every individual piece below has decades of precedent (§4) — but
the specific combination, framed around *certified elimination* with a full *provenance/receipt* trail
for every discarded candidate, is a genuinely different inference architecture from standard forward-only
generation, and is implemented and measured here, not just proposed.

---

## 2. Algorithm

Given an initial state $s_0$, a forward transition relation $T(s) \to \{s'\}$, a horizon $H$, and a
terminal constraint set $C_H$ (states admissible at time $H$):

1. **Forward pass.** Compute $F_t$ = the set of states reachable from $s_0$ in exactly $t$ steps, for
   $t = 0 \ldots H$, using only $T$.
2. **Backward pass.** Compute $B_t$ = the set of states that could reach some state in $C_H$ within
   $H - t$ steps, using the inverse relation $T^{-1}$ (the preimage).
3. **Intersect.** Set the working domain $D_t \leftarrow F_t \cap B_t$ at every $t$. Anything removed by
   the intersection is logged with the exact reason (not forward-reachable, or not backward-necessary).
4. **Apply certified nogoods.** Any domain-specific hard exclusion rule (bounds, forbidden patterns,
   conservation laws) is applied to every surviving state; violators are removed and logged.
5. **Re-propagate to a fixed point.** Because narrowing $D_t$ can now make some previously-valid
   transitions into/out of $D_{t\pm1}$ invalid, forward and backward consistency is re-checked between
   every adjacent pair of steps and re-applied until no domain changes in a full pass (or a
   contradiction — an empty domain — is reached).
6. **Report.** The final per-step domains, a full elimination log (every discarded state, exactly why),
   and a status: `FULLY_DETERMINED` (every step narrowed to one state — a single certified trajectory),
   `NARROWED` (uncertainty reduced but not eliminated — report the surviving candidates), or
   `CONTRADICTION` (the terminal constraint is provably impossible given the dynamics — itself a useful
   result, e.g. for anomaly/inconsistency detection).

This is a chain-structured constraint propagation algorithm. Correctness (soundness of eliminations) is
straightforward: a state is only ever removed because it is provably unreachable, provably unable to
reach the terminal constraint, or provably violates a stated hard rule — never because of a learned
score, an intuition, or a heuristic. (A learned/soft scorer may be used to prioritize *which* candidate
to inspect first inside the forward proposal step — it may never delete a candidate outright. This
mirrors the hard/soft distinction already established in this project's CSM work.)

---

## 3. Measured result (toy domain)

`demo_arithmetic_trajectory.py`: a counter starting at 3, with four possible operations per step
(+1, +2, ×2, −1), a 6-step horizon, and a known ending (30). Forward-only reachable-set size grows
unboundedly with the horizon (1 → 4 → 9 → 17 → 31 → 52 → 87). Running FATE Engine — intersecting that
forward set with the backward-necessary set computed from the known ending — narrows the domain at
**every intermediate step**, not just the last one:

| t | forward-only size | FATE narrowed size |
|---|---|---|
| 0 | 1 | 1 |
| 1 | 4 | 4 |
| 2 | 9 | 7 |
| 3 | 17 | 8 |
| 4 | 31 | 6 |
| 5 | 52 | 4 |
| 6 | 87 | **1** |

The terminal step is exactly determined (as expected — it was given). More importantly, steps 2-5 are
reduced by roughly 25-90% relative to forward-only reasoning, using only information already available
(the dynamics and the known ending) — no learned model, no guessing, and every single elimination is
logged with a checkable, restated reason. This is a small, honest, reproducible demonstration, not a
benchmark claim about any real-world task; see §5 for what would be required to make a stronger claim.

**Second measured result (grid-transformation domain, exact analytic inverse, no brute force):**
`demo_grid_trajectory.py` runs the same architecture over a 3x3 colored-grid state space undergoing
an unknown sequence of 4 possible bijective operations (rotate 90°, flip horizontal, flip vertical,
color-cycle), each supplied with its exact, hand-derived inverse rather than a brute-force preimage
search -- the scalable path this project's own §5 called for. Measured result on one run:

| t | forward-only size | FATE narrowed size |
|---|---|---|
| 0 | 1 | 1 |
| 1 | 2 | 2 |
| 2 | 3 | 2 |
| 3 | 4 | 2 |
| 4 | 5 | **1** |

Status: `NARROWED`, not `FULLY_DETERMINED` -- honestly reported. The dihedral/color-cycle operation
set has genuine internal symmetries (some operation sequences are indistinguishable from others on
certain grids), so ambiguity does not fully collapse with only 4 steps and 4 ops; this is a true
property of this operation set, not an engine failure, and matches this project's standing rule to
report exactly what a run produces rather than what would look best. The terminal step is still
exactly pinned, and steps 2-3 show real (if modest) narrowing versus forward-only growth. A cleaner
demonstration of full determinism would need either more steps, an operation set with less internal
symmetry, or a partial (rather than exact) terminal constraint -- noted as a next step below.

---

## 4. Relationship to established techniques (this is a combination, not a new primitive)

- **Arc-consistency / constraint propagation** (Mackworth, *Consistency in Networks of Relations*,
  1977; the AC-3 algorithm) — the general pattern of iteratively removing values that have no
  consistent neighbor until a fixed point, exactly what the re-propagation loop in step 5 does.
- **Simple Temporal Networks and interval propagation** (Dechter, Meiri & Pearl, *Temporal Constraint
  Networks*, Artificial Intelligence, 1991) — bidirectional tightening of a chain of temporal
  constraints; FATE Engine's forward/backward chain structure is a discrete-state analogue.
  # noqa
- **The Forward-Backward algorithm for Hidden Markov Models** (Baum & Welch; Rabiner, 1989) — computing
  forward and backward probability sweeps and combining them at each time step is the classical
  probabilistic ancestor of this exact structure, generalized here from probabilities to hard
  admissibility sets, and from a fixed known model to certified elimination.
- **Backward reachability / preimage computation in formal verification and control** (used broadly in
  model checking and safe-set computation) — computing the preimage of a target set under a transition
  relation is the same operation as the backward pass here.
- **The adjoint/costate method of optimal control** (Pontryagin et al., 1962) — the continuous-state
  ancestor of the same idea: a terminal constraint determines, via backward propagation, what earlier
  states/controls are admissible. `ECHO` (a companion document in this author's work) applies this
  continuous version with a full causal correctness argument; FATE Engine is its discrete-state,
  symbolic-elimination sibling.

**What is actually new here, stated honestly:** the combination of (a) a pluggable forward generative
proposal step (which can be a rule set, as in the demo, or a learned model in a real deployment), with
(b) exact certified backward elimination, (c) iterated jointly to a fixed point, and (d) a full
per-candidate provenance/receipt log usable for explanation ("this survived/was eliminated because...").
Individually, (a)-(c) exist in the literature above. The packaging — as a general-purpose, pluggable
inference engine with certified receipts, aimed at goal-conditioned and retrodictive prediction tasks —
is this project's contribution, and should be described exactly that way: a new architecture built from
established parts, not a new mathematical principle.

---

## 5. Honest limitations and next steps

- The current inverse-transition mechanism (`_inverse`) brute-forces the preimage over a supplied finite
  universe. This is correct but does not scale — a real deployment needs either an analytically known
  inverse, or a learned approximate inverse model (with its outputs still subject to the same hard
  nogood-checking, so approximation errors in the inverse cannot silently violate correctness).
- The demo domain is intentionally small and symbolic. No claim is made here about performance on any
  real-world sequence task (e.g. ARC-AGI grids, language, video); that would require a real transition
  model, a real terminal-constraint source (e.g. a partially observed later frame), and a real
  benchmark — none of which exist yet for this engine. Any future claim of task performance must be
  measured and logged with a reproducible script, per this project's established standard.
- The philosophical framing in `FATE_Teleological_Framework.md` is explicitly optional: this engine's
  correctness does not depend on, and does not require anyone to accept, the teleological
  interpretation offered there. The engine is fully explainable as ordinary bidirectional constraint
  propagation using already-available information; the teleological reading is a separate, clearly
  labeled interpretive layer, not a load-bearing part of the algorithm.
- Natural next step: replace the toy `transition_fn` with a real learned candidate generator (e.g. a
  small model proposing top-k next states) while keeping the certified backward elimination exact, and
  benchmark uncertainty reduction on a real dataset with genuine partial future information (e.g.
  masked-future video frames, or ARC-AGI-3 partial trajectories with a known goal state).

---

*Reality Theorized. Theory Realized.*
*Joshua Matthew Carter — NeverZero*
