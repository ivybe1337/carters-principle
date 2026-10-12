# ECHO: An Exact, Causal, Hamiltonian Framework for Boundary-Constrained Discrete Reasoning

**A Corrected Formal Treatment, Grounded in Established Literature**
**(Formerly circulated under the working name "SAPE" — renamed and corrected in this revision)**

**Author:** Joshua Matthew Carter
**Affiliation:** NeverZero
**Status:** Formal academic review and correction of the prior SAPE Whitepaper / Mathematical Theory
& Formal Proofs V2 / Systems Architecture Blueprint V2. Supersedes those drafts for any use requiring
peer, academic, or competition scrutiny.

> **Patent Pending** (Docket RAD-PROV-2026-001, where applicable to overlapping claims). Written
> content licensed [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). This
> document does not grant any license to practice the described systems commercially.

---

## On the name

**ECHO — Exact Causal Hamiltonian Optimizer.** The name is chosen deliberately to correct, not
continue, the framing problem in the prior draft. An echo is a signal that returns *after* a delay,
entirely because of something that already happened — it is one of the most ordinary, causal
phenomena in physics. That is precisely what this architecture's adjoint pass does: a constraint
stated at a later time sends a gradient signal backward through an already-executed trajectory. There
is no foreknowledge in an echo, and there is none here. Each word in the expansion names a property
actually proven in §3 below — **Exact** (the leapfrog map's Jacobian determinant, proven exactly, not
approximately), **Causal** (the adjoint pass, which uses only already-computed forward states),
**Hamiltonian** (the latent dynamics), **Optimizer** (the terminal-constraint solving mechanism).
Nothing in the name refers to prediction, precognition, or the author.

---

## Abstract

ECHO combines three separately well-established techniques — damped loopy belief propagation over a
factor graph, symplectic (leapfrog) integration of a latent Hamiltonian dynamic, and adjoint/costate
backpropagation for boundary-constrained trajectory optimization — into a single discrete-reasoning
architecture aimed at tasks such as ARC-AGI. The prior draft of this work (circulated as "SAPE")
described its adjoint mechanism using the language of "acausality," "teleological deduction," and
"non-causal intuition," and asserted an "unassailable" advantage without measurement. **These framings
were incorrect and are withdrawn in this revision.** The underlying mechanism — computing, via
backward-propagated adjoint variables, the present-time perturbation required to satisfy a terminal
constraint — is a fully causal, seventy-year-old technique from optimal control theory (the adjoint
form of Pontryagin's Minimum Principle) and its modern differentiable form (the continuous adjoint
sensitivity method used in Neural ODEs). Nothing about it involves foreknowledge; it is standard
two-point boundary value problem (TPBVP) solving. This revision restates ECHO's genuine, provable
properties precisely, corrects one claim that does not follow from the stated mathematics, flags one
component (the "Keystone" selection rule) as an unvalidated heuristic rather than a theorem, and
removes one performance figure that has not been independently measured or reproduced.

---

## 1. Introduction

Autoregressive sequence models that unroll a learned transition function step-by-step accumulate
error multiplicatively over long horizons, and offer no native mechanism for imposing a constraint on
a *future* state and solving backward for what the present state must be. ECHO addresses the second
problem directly: given a terminal constraint (e.g., "the completed grid must satisfy this symmetry"),
it computes the present-step correction required to satisfy it, using calculus, not search over
futures. This is a real and useful capability. It does not require, and should not be described using,
any language implying the system perceives, predicts, or has privileged access to the future. What
follows restates ECHO's three components with their actual mathematical status and their place in the
existing literature.

---

## 2. Related Work (establishing what ECHO inherits, and from where)

**Loopy belief propagation and the Bethe approximation.** Message passing on factor graphs, and the
identification of loopy BP's fixed points with stationary points of the Bethe free energy, is due to
Yedidia, Freeman, and Weiss (*Understanding Belief Propagation and Its Generalizations*, 2001), itself
building on Pearl's exact BP for trees (1988). Convergence of *damped* BP as a contraction mapping —
the property ECHO's Theorem 1 depends on — has sufficient conditions established by Mooij and Kappen
(*Sufficient Conditions for Convergence of the Sum-Product Algorithm*, IEEE Trans. Information Theory,
2007). ECHO's log-space, temperature-scaled formulation is a standard numerically-stable
reparameterization of this same algorithm.

**Symplectic and Hamiltonian integration.** Leapfrog (Störmer–Verlet) integration, its exact
volume-preservation property, and the associated "shadow Hamiltonian" backward-error analysis are
classical results in geometric numerical integration; the standard reference is Hairer, Lubich, and
Wanner, *Geometric Numerical Integration: Structure-Preserving Algorithms for Ordinary Differential
Equations* (Springer, 2006). Neural parameterizations of Hamiltonian dynamics are due to Greydanus,
Dzamba, and Yosinski (*Hamiltonian Neural Networks*, NeurIPS 2019) and Zhong, Dey, and Chakraborty
(*Symplectic ODE-Net*, ICLR 2020).

**Adjoint/costate methods and O(1)-memory reversible backpropagation.** The adjoint formulation of
optimal control with terminal constraints is due to Pontryagin, Boltyanskii, Gamkrelidze, and
Mishchenko (*The Mathematical Theory of Optimal Processes*, 1962) — developed originally for rocket
trajectory and guidance problems, i.e., explicitly causal engineering, not foresight. Its modern
differentiable/continuous form, including the O(1)-memory property that follows when the forward map
is analytically invertible, is due to Chen, Rubanova, Bettencourt, and Duvenaud (*Neural Ordinary
Differential Equations*, NeurIPS 2018), building on algebraically-reversible architectures such as
Gomez et al.'s *The Reversible Residual Network* (2017). ECHO's "reversible Leapfrog autograd kernel"
is a direct application of this line of work to a symplectic (rather than generic ODE) transition.

**Null-space exploration.** ECHO's "orthogonal novelty injection" — perturbing a state only within
the null space of a constraint gradient so as not to violate what is already established — is the
same idea used in redundant-manipulator control and constrained optimization (resolved-motion-rate
control; null-space projection methods), not a novel epistemic category.

**What is genuinely new here, and what is not.** The individual components above are all established.
What ECHO proposes as new is their *composition*: using a symplectic latent dynamic specifically so
that its adjoint pass is exactly reversible and volume-preserving, coupled to a belief-propagation
front end for discrete constraint satisfaction, applied to grid-based abstract reasoning (ARC-AGI).
That composition has not, to this reviewer's knowledge, been benchmarked in the literature and should
be presented as a proposed architecture, not a proven result.

---

## 3. Formal Restatement

### 3.1 Damped log-space belief propagation (sound, correctly attributed)

The factor-graph formulation, log-space message update, and momentum-damped fixed-point iteration in
the original documents are standard and correctly derived. The convergence claim should be stated with
its actual precondition, since it is a *sufficient*, not universal, condition:

**Proposition 1 (restated Theorem 1).** *If the damping factor β and compatibility norm bound M satisfy*
$(1-\beta)\frac{\|\mathbf{C}\|_{\max}}{\tau} + \beta < 1$, *the damped message-update operator is a
contraction on* $(\mathbb{R}^{|\mathcal{E}|\times K}, \|\cdot\|_\infty)$ *and converges geometrically
to a unique fixed point.* This is Mooij & Kappen's (2007) result, specialized to this graph. It is a
real, provable statement — but it is conditional on the stated bound; it does not hold for arbitrary
β, τ, or C, and should never be cited without the bound restated alongside it.

### 3.2 The Bethe "Keystone" rule — reclassified from theorem to heuristic

The original document's "Theorem 2" asserts that
$x^* = \arg\max_i\left[H(\mathbf{b}_i)\cdot\sqrt{\deg(i)}\right]$ is *the* optimal next variable to
instantiate. **This is not proven anywhere in the source material and does not follow from the Bethe
free energy stationarity condition alone.** Weighting marginal entropy by the square root of node
degree is a plausible design choice — it resembles influence-maximization heuristics and Elidan,
McGraw, and Koller's residual-magnitude scheduling for BP (*Residual Belief Propagation*, UAI 2006) —
but no derivation shows it maximizes expected information gain, expected constraint reduction, or any
other stated objective. It should be labeled and treated as:

**Heuristic H1 (not a theorem).** *A candidate variable-selection priority rule, motivated by
information-theoretic and graph-centrality intuition, whose optimality is unproven and must be
established empirically, task by task.*

This matters concretely for this project: a related search-priority heuristic (the ε operator-family
prior tested in the pre-registered E3 ablation referenced in `SAPE_TRIAGE_AND_INTEGRATION.md`) was
tested against the project's own kill criterion and returned a clean null result — identical solved
set, zero mean change in nodes searched — and was correctly removed rather than kept. The Keystone
rule is architecturally the same kind of claim (a priority heuristic asserted to help) and requires
the same ablation discipline before being trusted, let alone called a theorem.

### 3.3 Symplectic latent dynamics — the exact result, proven cleanly

The leapfrog map for a separable Hamiltonian $\mathcal{H}(\mathbf{q},\mathbf{p}) = \mathcal{V}(\mathbf{q}) + \tfrac{1}{2}\mathbf{p}^T\mathbf{p}$
decomposes into three shear maps:

$$
\mathbf{p}_{1/2} = \mathbf{p} - \tfrac{\Delta t}{2}\nabla\mathcal{V}(\mathbf{q}), \qquad
\mathbf{q}' = \mathbf{q} + \Delta t\,\mathbf{p}_{1/2}, \qquad
\mathbf{p}' = \mathbf{p}_{1/2} - \tfrac{\Delta t}{2}\nabla\mathcal{V}(\mathbf{q}')
$$

**Theorem 2 (corrected; proof supplied — this was previously asserted, not derived).** *Each of the
three sub-steps has Jacobian determinant exactly 1, so the composed leapfrog map does too — this is
the "Exact" in ECHO.*

*Proof.* Step 1 has Jacobian $\begin{pmatrix}I & 0\\ -\tfrac{\Delta t}{2}\nabla^2\mathcal{V}(\mathbf{q}) & I\end{pmatrix}$
— block lower-triangular with identity diagonal blocks, determinant 1. Step 2 has Jacobian
$\begin{pmatrix}I & \Delta t\, I\\ 0 & I\end{pmatrix}$, determinant 1. Step 3 is the same form as
step 1, determinant 1. The determinant of a composition is the product of determinants, so the full
map has determinant exactly 1. $\blacksquare$

This is the correct and considerably stronger replacement for the original "$1.0 \pm \epsilon_{\text{mach}}$"
statement: the property is **algebraically exact**, not a floating-point approximation, for any step
size $\Delta t$ and any potential $\mathcal{V}$. This is also where the original document's implicit
claim needs a real caveat: **exact phase-space volume preservation is not the same as zero trajectory
error.** The correct, classical statement (Hairer, Lubich & Wanner, 2006) is that a symplectic
integrator's numerical trajectory exactly follows a nearby "shadow Hamiltonian" $\tilde{\mathcal{H}} = \mathcal{H} + O(\Delta t^2)$,
so energy error is *bounded and oscillatory over arbitrarily long horizons* rather than drifting
secularly — a real and valuable property, but strictly weaker than the "zero-error," "gradients
mathematically cannot vanish or explode... regardless of depth" language in the prior draft, which
overstates what volume preservation guarantees about accumulated positional/state error.

### 3.4 Adjoint backpropagation — correctly reframed as a boundary value problem, not foresight

Given a terminal constraint $\Psi(\mathbf{q}_T)$, the adjoint (costate) update

$$
\boldsymbol{\lambda}_{\mathbf{q}} \leftarrow \boldsymbol{\lambda}_{\mathbf{q}} - \tfrac{\Delta t}{2}\mathbf{H}_{\mathcal{V}}(\mathbf{q})\boldsymbol{\lambda}_{\mathbf{p}}, \qquad
\boldsymbol{\lambda}_{\mathbf{p}} \leftarrow \boldsymbol{\lambda}_{\mathbf{p}} + \Delta t\,\boldsymbol{\lambda}_{\mathbf{q}}
$$

is the standard reverse-mode (vector-Jacobian product) pass through the leapfrog map, equivalent to
the continuous adjoint equations of Pontryagin's Minimum Principle. **This computation is fully
causal — this is the "Causal" in ECHO**: it takes a constraint stated at time $T$, already known at
the time of computation, and uses the chain rule backward through *already-executed* forward-time
steps to find the gradient of that constraint with respect to earlier states. No information from an
unrealized future enters the computation. It is exactly the same operation a bridge engineer performs
computing how a target deflection at one end constrains stresses elsewhere, or a Neural ODE performs
computing a loss gradient through a continuous-time trajectory — or, as the name suggests, exactly
what an echo is: a signal returning after a delay, entirely because of what already happened. Renamed
and reclassified:

- ~~"Teleological Adjoint Pullback (Intuition)"~~ → **Adjoint sensitivity pass for terminal-constrained
  optimization** (Pontryagin et al., 1962; Chen et al., 2018).
- ~~"True non-causal intuition"~~ → **Backward-propagated gradient of a known terminal constraint
  through an already-executed trajectory** — an ordinary, fully causal computation.
- ~~"Acausal Inference"~~ → **removed.** Nothing in the mathematics supports this term; it is struck
  from the framework's vocabulary.

The $O(1)$-memory claim is legitimate *and* correctly attributed once stated precisely: because the
leapfrog map is algebraically invertible (§3.3), intermediate forward states do not need to be cached
for the backward pass — they can be exactly recomputed from the terminal state. This is a genuine
memory/compute trade-off (Gomez et al., 2017; Chen et al., 2018), not a free lunch: it trades stored
activations for recomputation cost, which should be reported (recomputation adds a small constant
factor to backward-pass FLOPs) rather than omitted.

---

## 4. What Is Proven, What Is Heuristic, What Is Unverified

| Claim | Status | Basis |
|---|---|---|
| Damped log-space BP converges to a unique fixed point | **Proven, conditional** | Contraction mapping, given the stated β/τ/‖C‖ bound (Mooij & Kappen, 2007) |
| Loopy BP fixed points ≡ Bethe free energy stationary points | **Proven (established result)** | Yedidia, Freeman & Weiss, 2001 |
| Leapfrog map has exact unit Jacobian determinant | **Proven** | Shear decomposition, §3.3 above |
| Symplectic integration bounds long-horizon energy error | **Proven (established result), narrower than originally stated** | Shadow Hamiltonian / backward error analysis (Hairer, Lubich & Wanner, 2006) — bounds energy drift, does not imply zero state error |
| Adjoint backward pass is exact and fully causal | **Proven** | Standard reverse-mode VJP / Pontryagin adjoint equations |
| $O(1)$ memory reversible backward pass | **Proven, with a cost caveat** | Requires recomputation of forward states; trades memory for FLOPs |
| Bethe Keystone rule ($\arg\max H(\mathbf{b}_i)\sqrt{\deg(i)}$) is the optimal next variable | **Unproven — heuristic** | No derivation from a stated objective; requires ablation, same as the already-nulled ε priority test |
| 81-node grid inference: 2.4s → 3.8ms | **Unverified — not independently reproduced** | No benchmark script or raw output located; do not cite until measured and logged with hardware/config |
| "Guarantees zero-error test output grid compliance" | **Does not follow from the stated math — withdrawn** | Volume preservation and exact adjoints do not, by themselves, guarantee task correctness; correctness depends on whether $\Psi$ actually characterizes the true target, which is a modeling assumption, not a proven guarantee |
| "Unassailable Advantage" framing | **Withdrawn — banned superlative per this project's own ground-truth rules** | No claim of this kind should be made about anything not run and measured |

---

## 5. Corrected Terminology (for use in all future ECHO material)

| Prior term (SAPE draft) | Corrected term (ECHO) |
|---|---|
| Acausal inference | Boundary-value (terminal-constrained) trajectory optimization |
| Teleological deduction / pullback | Adjoint sensitivity backpropagation |
| True non-causal intuition | Backward-propagated gradient of a known terminal constraint |
| Unassailable advantage | (state the specific proven property, with its precondition) |
| Zero-error guarantee | Bounded, non-secular energy error under symplectic integration |

---

## 6. Required Validation Before Any Competition Integration

Consistent with this project's own kill-criterion discipline (as already applied successfully to the
ε priority-ordering test):

1. **Benchmark the latency claim.** Reproduce the 81-node timing figure with a checked-in script and
   logged hardware/config, or remove the number.
2. **Ablate the Keystone rule.** Pre-register a kill criterion (e.g., solved-task count and
   nodes-searched, matching the existing E3 methodology) comparing Keystone-guided selection against
   a matched random or residual-magnitude baseline. Keep only if it clears the bar.
3. **Do not merge into the SSM/CSM/ARC flagship** until (1) and (2) are complete — per this project's
   own inclusion rule: *"No architecture enters the flagship because it is elegant... it enters only
   when the immutable harness shows a correctness/performance contribution on the task where it is
   used."* ECHO has not yet cleared that bar.

---

## 7. Conclusion

ECHO's actual mathematical content — damped belief propagation with a real convergence proof, exactly
volume-preserving symplectic latent dynamics, and a causal adjoint pass that reuses sixty-year-old
optimal control theory for O(1)-memory backpropagation — is legitimate, citable, and worth keeping.
None of it required, or benefits from, the language of acausality, teleology, or unassailability that
surrounded it under the old name. Stated plainly and correctly, with its real preconditions and one
heuristic component honestly flagged as unproven, ECHO is a defensible, if not yet validated,
architectural proposal — which is a stronger position for a competition submission than an inflated
one, and the only version of this paper that should leave this workspace.

---

*Reality Theorized. Theory Realized.*
*Joshua Matthew Carter — NeverZero*
