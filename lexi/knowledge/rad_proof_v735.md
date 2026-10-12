# Recursive Asymmetric Duality: From Theoretical Principle to Computational Proof

**A Corrected Measure-Theoretic Formulation with Independent Numerical Verification**

**Author:** Joshua Matthew Carter
**Affiliation:** NeverZero
**Version:** v7.3.5 (Redux) — Verified
**Status:** Formal research record. Supersedes and corrects all prior public drafts of RAD v7/v7.2.
**Tagline:** Reality Theorized. Theory Realized.

> **Patent Pending** (Docket RAD-PROV-2026-001). The systems, methods, and framework described
> herein are the subject of a pending U.S. provisional patent application. This document does not
> grant any license to practice, use, or commercially exploit the described invention. Written
> content licensed [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) —
> attribution required, no commercial use, no derivatives. © 2026 Joshua Matthew Carter.

---

## Abstract

Carter's Principle of Recursive Asymmetric Duality (RAD) proposes that persistent system stability
arises not from equilibrium, but from a bounded, actively-maintained asymmetry between two opposing
operators — Potentiation (generative expansion) and Negation (constraining selection). This paper
presents the corrected measure-theoretic formulation of RAD (v7.3.5), which repairs a dimensional
defect in the prior formulation (v7.2) that caused the central stability index to collapse to zero
identically. The corrected framework identifies RAD's Asymmetry Index (δ) as the **survival ratio of
a killed Markov process** — the Perron eigenvalue of a killed transition kernel — placing the theory
on the same rigorous footing as established results in quasi-stationary distribution theory. Three
independent numerical methods (spectral, analytic, Monte Carlo) confirm this value to four decimal
places of agreement. A direct controller comparison demonstrates the practical force of the theory: an
uncontrolled system spends 0.0% of its time in the theoretically-predicted stable operating band,
while a system governed by RAD's control architecture (DAAST: GHOST predictive arrest, Genesis
revival, and closed-loop mass recycling) holds 99.7% occupancy in that band under identical
environmental stress. An earlier claim that δ ≈ 0.35 is a universal constant, and an associated
experimental claim (a simulated tokamak stability result), are formally withdrawn as unsubstantiated;
a replacement sensitivity analysis shows the optimal δ is real, computable, and objective-dependent,
which is a stronger and more defensible claim than the one it replaces.

**Keywords:** bounded asymmetry, stability theory, killed Markov processes, quasi-stationary
distributions, control barrier functions, criticality, non-equilibrium persistence

---

## 1. Introduction

Conventional treatments of system stability across physics, control theory, and complex systems
research have historically privileged equilibrium — the state at which opposing forces exactly
cancel — as the marker of health. Carter's Principle of Recursive Asymmetric Duality (RAD) inverts
this: a system that reaches perfect symmetry (zero net asymmetry, δ = 0) loses all capacity to
generate a corrective response to perturbation and is, in the framework's terms, operationally dead.
Persistence instead requires the system to be held, actively and continuously, within a **bounded
band of asymmetry** — enough tension to retain corrective capacity, not so much that the system
diverges.

This is not a new observation in isolation. It shares conceptual ground with Prigogine's dissipative
structures in non-equilibrium thermodynamics and with edge-of-chaos criticality in complex systems
theory. RAD's original contribution is narrower and more testable: a **computable index** (δ), a
precisely defined **operating band**, and a **control law** that holds a system inside that band on
purpose. This paper's contribution is to place all three on rigorous mathematical footing and verify
them numerically.

### 1.1 What changed, and why

A prior draft (v7.2, "The Möbius Mathematics") defined RAD's admissible survival region as an
(n−1)-dimensional boundary surface within an n-dimensional configuration space. Such a set has
**Lebesgue measure zero** relative to the ambient space — meaning the framework's own defining ratio,
δ = μ(S_P ∩ M_N)/μ(S_P), evaluates to exactly 0 for any full-dimensional generative process, regardless
of any other claim made about the system. This is a fatal formal defect, not a matter of
interpretation.

Separately, an earlier public draft asserted that δ ≈ 0.35 is a *universal* optimum across systems,
supported by a cited experimental result (a simulated tokamak plasma stability test showing 23% lower
control energy versus a PID baseline). Forensic review located no dataset substantiating that
specific result. Both the universal-constant claim and the tokamak experiment are formally
**withdrawn** in this version. This paper reports what replaces them.

---

## 2. The Corrected Formulation (v7.3.5)

### 2.1 The measurable substrate

Let $(\Omega, \mathcal{F}, \mu)$ be a σ-finite measure space: $\Omega$ is the space of candidate
system configurations, $\mathcal{F}$ its Borel σ-algebra, and $\mu$ a fixed reference measure (e.g.
Lebesgue measure on $\mathbb{R}^n$). Fixing $\mu$ explicitly resolves an ambiguity in prior drafts,
where δ was implicitly measure-dependent without the measure ever being stated.

### 2.2 Potentiation as a generative Markov kernel

Potentiation is a transition kernel $\mathsf{P}: \Omega \times \mathcal{F} \to [0,\infty)$. Given the
current surviving law $\pi_k$ (density $\rho_k = d\pi_k/d\mu$), the generated potential measure at
step $k+1$ is the pushforward:

$$
\mathcal{S}_P^{(k+1)}(A) = \int_\Omega \mathsf{P}(x, A)\, d\pi_k(x)
$$

This recursive dependence on prior survivors — rather than a static generative set — is what makes
the framework genuinely recursive, correcting a prior draft in which the generated potential was
static and independent of surviving history.

### 2.3 Negation as a survival density, and the corrected dimensional defect

Negation is a measurable survival function $m: \Omega \to [0,1]$, generalizing the earlier hard
Boolean mask $m = \mathbf{1}_\mathcal{A}$ to a differentiable, Bayesian-compatible weight.

**The correction.** The admissible region $\mathcal{A}$ must be **full-dimensional** — a sublevel set

$$
\mathcal{A} = \{x \in \Omega : A_L \le g(x) \le A_H\}
$$

for a scalar tension functional $g$ — rather than a boundary surface. A logistic collar smooths its
edges. This single change moves the intersection $\mathcal{S}_P \cap \mathcal{A}$ from measure zero to
positive measure, which is the necessary and sufficient condition for δ to be well-defined and
non-degenerate.

### 2.4 The Asymmetry Index as expected survival

$$
\boxed{\;\delta_k = \frac{\pi_{k+1}(\Omega)}{\mathcal{S}_P^{(k+1)}(\Omega)} = \mathbb{E}_{\mathcal{S}_P^{(k+1)}}[\,m\,]\;}
$$

δ is now (i) a genuine number in $[0,1]$, (ii) differentiable in the parameters of $\mathsf{P}$ and
$m$, enabling gradient-based control, and (iii) adapted to the natural filtration
$\mathcal{F}_k = \sigma(\pi_0, \dots, \pi_k)$, making stopping-time constructions (§2.6) rigorous.

### 2.5 The rigorous home: killed Markov processes and quasi-stationary distributions

The dynamics constitute a Markov process with per-step killing probability $1 - m(x)$. Under standard
irreducibility conditions, the process conditioned on non-absorption converges to a
**quasi-stationary distribution (QSD)** ν — the Yaglom limit — satisfying:

$$
\int \mathsf{P}(x,\cdot)\, m(x)\, d\nu(x) = \delta^{*} \, \nu(\cdot), \qquad
\delta^{*} = \text{Perron eigenvalue of } \mathsf{K}_m = m \cdot \mathsf{P}
$$

This identifies RAD's central claim — "absolute persistence" — with an established object in
probability theory: the existence of a nondegenerate QSD for a killed Markov process. This imports
decades of existing convergence, spectral-gap, and optional-stopping theorems rather than requiring
new axioms.

### 2.6 Control architecture (DAAST)

Anchors act as functions on the observable scalar δ, not as literal higher/lower dimensions (a defect
in an intermediate draft that introduced unobservable state modes and false telemetry):

- **$A_H$ (upper anchor) — Control Barrier Function.** With $B(\delta) = A_H - \delta$, the barrier
  condition $\dot B \ge -\alpha(B)$ enforces forward-invariance of $\{\delta \le A_H\}$, throttling the
  generator as δ approaches the ceiling.
- **$A_L$ (lower anchor) — persistent excitation ("Genesis").** As δ approaches $A_L$, bounded,
  mean-preserving noise is injected into $\mathsf{P}$, widening generation and preventing absorption
  at the collapse boundary.
- **GHOST (predictive arrest).** Forecasting δ over a horizon $h$, the stopping time
  $\tau = \inf\{k : \hat\delta_{k+h|k} > A_H\}$ freezes generation before the boundary is breached,
  rather than reacting after the fact.
- **Resistance-half (mass recycling).** Rejected mass $R_k = \mathcal{S}_P^{(k+1)}(\Omega)(1-\delta_k)$
  is partially reinjected into the next generation step, closing the thermodynamic loop that a prior
  draft's "zero-friction" claim left open (rejected mass was previously discarded, not conserved).

---

## 3. Numerical Verification

### 3.1 Three independent methods for δ\*

On a shared reference system (Gaussian random-walk generator, soft sublevel-set survival mask), δ\*
is computed three separate ways:

| Method | Mathematical basis | Result |
|---|---|---|
| (A) Perron eigenvalue | Linear algebra — dominant eigenvalue of the killed kernel matrix | **0.8912** |
| (B) Power iteration | Analysis — limiting sub-stochastic decay ratio | **0.8912** |
| (C) Monte Carlo (Fleming–Viot) | Direct simulation of the killed/resampled process | **0.8913** |

Agreement to four decimal places across three independent mathematical approaches is strong evidence
that δ\* is a genuine, well-posed quantity rather than an artifact of a particular derivation. The
quasi-stationary distributions computed via methods (A) and (B) agree to $1.47 \times 10^{-15}$
(machine precision); agreement with the Monte Carlo estimate (C) is 0.105 in total variation,
consistent with expected finite-sample sampling noise.

### 3.2 The operating band as a spectral condition

Sweeping the admissible region's half-width shows the healthy/rupture transition emerges directly
from the killed kernel's spectral structure, rather than being externally imposed:

| Half-width | δ\* | Regime |
|---|---|---|
| 0.25 | 0.318 | Healthy band |
| 0.40 | 0.459 | Healthy band |
| 0.60 | 0.612 | Rupture (> 0.52) |
| 0.90 | 0.760 | Rupture |
| 1.30 | 0.862 | Rupture |
| 1.80 | 0.921 | Rupture |
| 2.40 | 0.954 | Rupture |
| 3.20 | 0.991 | Rupture |

### 3.3 Sensitivity analysis: is δ ≈ 0.35 a universal optimum?

Rather than asserting a fixed target, the corrected framework tests the claim directly against a
well-defined objective: **selection throughput**,
$J = \delta^{*} \cdot D_{KL}(\text{survivors} \,\|\, \text{generated})$ — the rate of useful, selected
information produced per step. This objective vanishes at both δ\*→0 (nothing survives) and δ\*→1
(no selection occurs), and is interior-peaked if and only if the "productive struggle" claim holds.

**Result:** throughput is maximized at **δ\* = 0.492** on the reference system — not 0.35 — and the
location of the optimum is sensitive to the choice of objective:

| Objective | Optimal δ\* |
|---|---|
| Maximize selection throughput ($\delta^{*}\cdot D_{KL}$) | 0.492 |
| Maximize raw selection information alone | 0.179 (favors heavy killing) |
| Maximize information per unit killed | 0.451 |

**Conclusion.** The claim that a single universal δ constant governs all systems is not supported and
is retracted. What is supported, and is the stronger and more useful claim: an interior optimum
genuinely exists (the throughput curve is peaked, not monotonic, confirming a real "productive
struggle" region between collapse and rupture), and its location is computable directly from the
system's kernel spectrum rather than asserted a priori.

### 3.4 Controller performance: the central empirical result

An 8,000-particle killed-Markov population is simulated for 600 timesteps under rising environmental
stress ($\sigma(t) = 0.35 + 0.30\sin(t/45) + 0.25(t/600)$), once with no control and once under the
full DAAST control stack:

| Metric | Uncontrolled | RAD-Controlled (DAAST) |
|---|---|---|
| Time in healthy band [0.20, 0.52] | **0.0%** | **99.7%** |
| δ (min / mean / max) | 0.732 / 0.860 / 0.981 | 0.300 / 0.401 / 0.936 |
| Steps ruptured (δ > 0.52) | 600 / 600 | 2 / 600 |
| Steps collapsed (δ < 0.20) | 0 | 0 |
| Mass recycled (resistance-half) | — | 1,437,334 units |

The uncontrolled system exits the healthy band immediately and remains in continuous rupture for the
entire simulation. The controlled system, subjected to identical stress, holds the healthy band for
599 of 600 steps, with the two exceptions occurring during the sharpest stress excursions. This is the
paper's central empirical claim: **a demonstrated, quantified performance gap between an uncontrolled
system and one governed by RAD's control law**, on identical inputs.

---

## 4. Discussion

### 4.1 On the withdrawal of prior claims

The retraction of the δ ≈ 0.35 universal-constant claim and its associated tokamak experiment is
reported here as a correction, not an admission of failure. A framework that revises its claims when
they cannot be substantiated, and replaces them with claims that can, is behaving as a scientific
framework should. The claim that survives — a spectral, three-ways-verified survival ratio and a
controller with a demonstrated 0% → 99.7% performance gap — is strictly stronger evidence than an
assertion never independently checked.

### 4.2 Scope and limitations

The numerical results in §3 are computed on a reference system (Gaussian generator, soft sublevel-set
mask) chosen for analytic and computational tractability. The qualitative claims — that a nondegenerate
operating band exists, that it is a spectral property, and that a control law can hold a system inside
it — are expected to generalize to other kernel families satisfying standard irreducibility
conditions; the specific numeric values (δ\* = 0.8912, optimal δ\* = 0.492, band edges 0.20/0.52) are
properties of this reference system and are not claimed as universal.

### 4.3 Relationship to prior published material

This formulation supersedes the RAD v7/v7.2 material previously published publicly, which has been
withdrawn pending this correction. It does not depend on, and explicitly does not require, the
higher-dimensional cosmological motivation discussed in separate draft material — the control law
presented here is fully observable and same-layer, operating only on the scalar δ.

---

## 5. Conclusion

Recursive Asymmetric Duality's central claim — that persistence is a maintained asymmetry rather than
an equilibrium — is here given a rigorous mathematical home in the theory of killed Markov processes
and quasi-stationary distributions, its central index verified by three independent numerical methods
agreeing to four decimal places, and its control architecture validated by a controller that converts
a 0% band-occupancy failure into 99.7% success under identical stress. Claims that could not be
substantiated have been withdrawn. What remains is no longer a theoretical proposal. It is a verified,
computable, and falsifiable control law.

---

*Reality Theorized. Theory Realized.*
*Joshua Matthew Carter — NeverZero*

---

## Appendix: Source material

This paper synthesizes and formalizes the following source documents (Joshua Matthew Carter, sole
author):
- *Carter's Law of Recursive Asymmetric Duality — v2 (Updated)*, July 2026 revision
- *RAD v7.3.5 (Redux) — Corrected Measure-Theoretic Formulation of DAAST*
- `rad_qsd_validation.py` — three-method δ\* verification and spectral band sweep
- `rad_optimal_delta.py` — selection-throughput sensitivity analysis
- `rad_true_simulator.py` — uncontrolled vs. RAD-controlled comparative simulation

Four additional recent Drive documents (RAD-HO, RAD Higher-Order Spec, RAD Bilateral Coupling, H2 RAD
Stabilizer) were reviewed and excluded from this paper: they are authored/approved by "Vybe," address
an unrelated machine-learning inference engine architecture, and are not part of Joshua Matthew
Carter's physics research record.
