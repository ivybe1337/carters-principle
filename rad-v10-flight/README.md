# RAD v10 — Flight Realization

Reference implementation of Carter's RAD v10 tensor-operator formalism,
as realized in the Pocketship flight core (§8 — stability control).

- `radPhysics.js` — P/N tensor-operator physics: potentiate/negate flows,
  engaged gain, δ balance telemetry, Q = ½[P,N] commutator, control law (§6.2)
- `radEngine.js` — engine wiring the formalism to a live state vector

Source: extracted from the Pocketship game (see ivybe1337/StarMap),
originally prototyped with Base44's coding agent, Sept 2026.
