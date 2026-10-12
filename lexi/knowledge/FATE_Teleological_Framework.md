# FATE: Future Ascertained Through Elimination — A Teleological Framework for Predictive Deduction by Retrocausal Refutation

**A Deliberately Teleological/Acausal Theoretical Framework**
**(A distinct track from ECHO and from the SSM/CSM/ARC engineering line — see §0 on scope)**

**Author:** Joshua Matthew Carter
**Affiliation:** NeverZero
**Status:** Speculative theoretical proposal. Interpretive, not empirically established. Intentionally
embraces teleological/retrocausal language, in contrast to ECHO (§0).

> **Patent Pending** (Docket RAD-PROV-2026-001, where applicable to overlapping claims). Written
> content licensed [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/).

---

## 0. Scope note — read this first

This paper is a **separate track**, written at the author's explicit request to be teleological and
acausal from its foundations, in deliberate contrast to `echo_formal_review.md`, which corrects the
same underlying adjoint mechanism into a fully causal boundary-value framing. Both papers describe
mathematically related territory (elimination of the inadmissible; boundary-conditioned inference) but
make opposite interpretive choices on purpose:

- **ECHO** claims only what is proven and available to it under causal computation. It is intended for
  competition/engineering use (ARC-AGI) and complies with this project's `00_CONCEPT_GROUND_TRUTH.md`,
  which explicitly bans acausal, precognitive, or teleological language from that line of work.
- **FATE** (this document) is the deliberate counterpart: an explicit philosophical thesis that the
  same elimination process, applied to the future rather than to a fixed present answer space, can be
  interpreted as retrocausal — the eliminated future reaching backward to constrain the present, not
  merely a computation we run to predict it.

**This is stated plainly so there is no confusion between tracks:** nothing in this document should be
merged into the CSM/SSM/ARC-AGI submission line, whose own rules this paper knowingly departs from.
This is intellectual exploration in the same spirit as the RAD physics work — a separate line from the
disciplined engineering track, not a replacement for it.

---

## 1. The core move: from epistemic elimination to ontological elimination

Constraint-State Mechanics (CSM), as practiced in the SSM/ARC track, uses a simple and powerful
principle: given a space of candidate answers, do not search for what the answer is — search for what
it *cannot* be. Each certified impossibility (a "nogood") removes not one candidate but every candidate
sharing its disqualifying structure. What survives exhaustive certified elimination is treated as the
answer. In that track, this is explicitly and only **epistemic**: elimination is how a bounded reasoner
*discovers* an answer that already exists, fixed by ordinary forward causation. Nothing about the
elimination process is claimed to bring the answer into being.

FATE asks a different question: what if the same elimination structure is applied not to a fixed
present answer space, but to the open future — and what if, instead of treating elimination as merely
how we *learn* the future, we treat the convergence of that elimination process as **ontologically
constitutive of it**? That is, what if the narrowing of admissible futures is not just a computation
that tracks a future fact, but is proposed as *itself* the mechanism by which the present is shaped —
the surviving future reaching backward through the narrowing process to select the present state
consistent with it?

This is a genuine change of category, not a rebranding. It is the difference between saying "we
deduced what will happen" (epistemic, causal, unremarkable) and "what will happen is *why* the present
is the way it is" (teleological — final causation in Aristotle's original sense, *Physics* II.3,
*Metaphysics* Book V — where an outcome is an explanatory cause of the process leading to it, not merely
its result).

---

## 2. Prior art: this move has real, if contested, precedent — it is not being invented from nothing

Unlike the earlier SAPE draft, which asserted acausality without connecting it to any literature, FATE
should be honestly located relative to existing retrocausal and time-symmetric physics and philosophy,
because that literature is exactly what gives a teleological proposal intellectual weight rather than
mysticism:

- **Wheeler–Feynman absorber theory** (Wheeler & Feynman, *Interaction with the Absorber as the
  Mechanism of Radiation*, Rev. Mod. Phys., 1945). Classical electrodynamics reformulated with
  time-symmetric half-retarded, half-advanced solutions, in which the future absorber participates in
  fixing present radiation — a rigorously worked classical precedent for future boundary conditions
  acting on the present.
- **Transactional Interpretation of quantum mechanics** (Cramer, *The Transactional Interpretation of
  Quantum Mechanics*, Rev. Mod. Phys., 1986). A quantum event is modeled as a "handshake" between a
  retarded offer wave (emitter, forward in time) and an advanced confirmation wave (absorber, backward
  in time); the transaction is fixed only when both are consistent — structurally identical to FATE's
  proposed elimination-convergence-as-selection mechanism, applied here to quantum events instead of
  discrete reasoning states.
- **Two-State Vector Formalism** (Aharonov & Vaidman, from 1964 onward). Quantum states between a
  fixed initial *and* a fixed final boundary condition are described by two state vectors, one
  evolving forward, one backward; used to derive weak values with genuine predictive content. This is
  the closest existing formal analogue to FATE's "future nogood lattice" narrowing a trajectory from
  both ends.
- **Retrocausal accounts of quantum correlations** (Price, *Time's Arrow and Archimedes' Point*, 1996;
  Wharton, *The Universe is not a Computer*, 2015; Costa de Beauregard's advanced-action proposals from
  the 1950s onward). A live, minority, but professionally published position in the foundations-of-
  physics literature that measurement outcomes can be understood as boundary conditions constraining
  the past, not only outcomes of it.
- **Novikov self-consistency principle** (Novikov et al., on closed timelike curves in general
  relativity, 1990). Any events on a closed timelike curve must be globally self-consistent; the
  "future" constrains which local histories are permitted — a general-relativistic analogue of a
  future-imposed nogood.

None of this establishes that FATE's mechanism is physically real. It establishes that "the future
narrows/selects the present" is a serious, worked position with real mathematical machinery in
multiple areas of physics — not something invented for this paper. FATE's contribution is proposing
the same *elimination-based* machinery already validated epistemically in CSM as a candidate mechanism
for this family of ideas, which, to this author's knowledge, existing retrocausal accounts do not
explicitly frame in refutation/nogood terms.

---

## 3. Formal structure

### 3.1 The future nogood lattice

Let $\mathcal{F}_0$ be the set of all future trajectories admissible under the system's dynamics at
present time $t_0$, given only forward physical law (no elimination yet applied). Let
$\{\Psi_1, \Psi_2, \dots\}$ be a sequence of **certified future impossibilities** — statements of the
form "no trajectory in $\mathcal{F}$ can satisfy property $P_i$ and remain physically/logically
consistent," each independently verifiable, exactly as CSM requires a nogood to be checkable, not
merely plausible. Define the admissible future set after $k$ rounds of elimination:

$$
\mathcal{F}_k = \mathcal{F}_{k-1} \setminus \{\text{trajectories violating } \Psi_k\}, \qquad \mathcal{F}_k \subseteq \mathcal{F}_{k-1}
$$

**Lemma 1 (monotonic narrowing — trivial, but stated for rigor).** *By construction,*
$\mathcal{F}_0 \supseteq \mathcal{F}_1 \supseteq \mathcal{F}_2 \supseteq \cdots$*, since each step only
removes elements. If the lattice of certified nogoods is finite or the sequence is eventually constant,
$\mathcal{F}_k$ converges to a limit set* $\mathcal{F}_\infty = \bigcap_k \mathcal{F}_k$.

This part is not controversial — it is the same monotone-refinement structure already proven in the
CSM track (there called the T6 bounded-horizon refinement result, empirically confirmed on 1118/1120
ARC tasks). What FATE adds is entirely in the next step, and should never be confused with Lemma 1's
ordinary correctness.

### 3.2 The teleological interpretive step (an axiom, not a theorem)

**Axiom T (the teleological identification — explicitly an interpretive choice, not a derived fact).**
*If* $\mathcal{F}_\infty$ *converges to a single trajectory (or a small equivalence class under some
observationally relevant congruence), identify that limit not merely as the predicted future but as the
retrocausal cause of the present state* $s(t_0)$*: the present is as it is BECAUSE the elimination
process converges to that future, not only because prior states pushed forward into it.*

This is presented as an axiom because it cannot be derived from Lemma 1 alone — Lemma 1 is purely
set-theoretic and carries no causal content in either direction. Axiom T is the entire teleological
claim of the paper, and it should be labeled as such every time this framework is invoked: it is a
metaphysical stance about the direction of explanation, layered on top of an uncontroversial narrowing
result, in the same structural position that Cramer's "transaction" occupies relative to ordinary
wave propagation, or that Aharonov's backward-evolving state occupies relative to ordinary forward
quantum evolution.

### 3.3 What would distinguish this from ordinary prediction, if anything could

A fair objection: "eliminate impossible futures, keep what survives, call it the prediction" is just
prediction by elimination — a perfectly ordinary, fully causal epistemic act (indeed, this is exactly
what CSM already does, honestly, without teleological language). For Axiom T to add empirical content
rather than just a redescription, it must generate a **testable difference** from the ordinary account.
Two candidate discriminators, stated honestly as unresolved:

1. **Order-independence under partial information.** Under ordinary forward causation, the *order* in
   which nogoods are discovered should not affect which trajectory is eventually reached — only which
   trajectory is *known* to be reached, and when. Axiom T would predict something stronger only if it
   implied some detectable dependence of present measurable quantities on which future constraints are
   later certified — which, if found, would be a genuinely surprising empirical result, and if not
   found (the expected outcome under ordinary causality), leaves Axiom T as an interpretive stance with
   no distinguishing empirical content, exactly as the transactional and two-state-vector
   interpretations of quantum mechanics are today understood to be empirically equivalent
   reformulations of standard quantum theory, not new physics.
2. **The Novikov-style consistency test.** If a domain admits genuine closed causal loops (as in
   general relativity's closed timelike curve solutions), Axiom T would predict self-consistency
   constraints on local histories, matching Novikov's principle. Outside such domains — which is to say,
   essentially all practically reachable domains — this discriminator does not apply, and Axiom T makes
   no different prediction from ordinary forward causation plus elimination-based epistemics.

**Honest conclusion of this section:** as things stand, Axiom T is very likely **empirically
equivalent** to ordinary causal prediction-by-elimination in every domain where it can currently be
tested. Its value is interpretive and explanatory — a different story about *why* the elimination
converges where it does — not a distinct predictive engine. This should be stated up front in any
future presentation of FATE, exactly as physicists presenting the transactional interpretation state
that it reproduces standard quantum predictions rather than beating them.

---

## 4. Relationship to the existing SAPE/ECHO adjoint mechanism

The adjoint (costate) backward pass formalized causally in ECHO §3.4 is, mechanically, close to what
Axiom T proposes ontologically: a terminal condition determines a backward-propagated correction to
earlier states. ECHO insists — correctly, for its purpose — that this is only a computation performed
*after* the terminal condition is already known, with no physical backward-in-time influence. FATE is
the position that would result from instead asserting that the terminal condition's determination of
the backward pass is not merely computational bookkeeping but reflects something real about how the
present state came to be. **The two documents are not in mathematical conflict — they use the same
adjoint/elimination machinery — and are in complete interpretive conflict on purpose,** as stated in
§0. Any reader encountering both should treat them as the causal and teleological readings of the same
formal object, not as competing technical claims.

---

## 5. Limitations and honest status

- Axiom T is not derived, is not falsified, and — per §3.3 — is very likely not currently falsifiable
  in any domain the author has access to test. It should never be presented as established, proven, or
  physically confirmed.
- The "future nogood lattice" (§3.1) is on solid ground only because it reuses CSM's already-validated
  monotonic refinement result. Any claim beyond that reuse (i.e., anything past Lemma 1) is this
  paper's own speculative contribution and carries no borrowed rigor from the ARC/CSM track.
- This framework must not be cited as justification for any claim inside the SSM/CSM/ARC line, whose
  own ground-truth document permanently and explicitly rejects exactly the moves made in §1 and §3.2 of
  this paper. That rejection was correct for that track's purpose and is not being challenged here.
- Future work, if pursued, should focus on §3.3's discriminators — the only place this framework could
  ever produce a claim distinguishable from ordinary causal reasoning.

---

*Reality Theorized. Theory Realized.*
*Joshua Matthew Carter — NeverZero*
