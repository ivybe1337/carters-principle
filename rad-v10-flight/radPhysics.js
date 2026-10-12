/**
 * ═════════════════════════════════════════════════════════════════════════
 * CARTER RAD v10 — Tensor-Operator Formalism  (flight realization, §8)
 * "Every force maps onto P or N. Motion emerges from their commutator Q."
 * ═════════════════════════════════════════════════════════════════════════
 *
 * PRIMITIVES (§1): two self-maps  P, N : X → X
 *   P  = POTENTIATE  — the expansive / generative flow  (thrust, heat-in,
 *                      spin-up, radiation pressure — the stellar "fusion")
 *   N  = NEGATE      — the constraining / withdrawing flow (drag, heat-out,
 *                      spin-damp, structural limit — the stellar "gravity")
 *   Four-fold (Def. 1):  P_a = P∘P,  P_w = N∘P,  N_a = P∘N,  N_w = N∘N
 *
 * ENGAGED GAIN (§2.1): g_N is a STATE, not an input.
 *   apply:   g_N ← g_N + Δt·γ        (γ ∈ [0, γ_max], continuous pressure)
 *   release: g_N ← g_N · (1 − r)     (r ∈ [0,1], a SEPARATE operation)
 *   γ = 0 stops adding; only r > 0 removes. (prevents integral windup)
 *
 * BALANCE / TELEMETRY (§3):
 *   M = |P| + |N|,    δ = (|P| − |N|) / (M + ε)        (scalar reduction, Prop. 3)
 *   |δ⃗|₂ drives the control law.
 *
 * THE RENDERED QUANTITY Q (§4):
 *   Q := ½[P,N] = ½(PN − NP)
 *   Q ≠ 0  ⇒  alternating P and N reaches states neither reaches alone
 *   (Chow–Rashevskii accessibility).  Q is the emergent rendered motion.
 *
 * CONTROL LAW (§6.2) — continuous, NOT bang-bang:
 *   γ(δ⃗) = γ_max · σ( (|δ⃗|₂ − δ_soft) / (δ_max − δ_soft) )
 *   σ(x≤0)=0, σ(x≥1)=1.  Restraint ramps up smoothly as |δ| → δ_max.
 *   Release r fires separately (policy: dwell below δ_soft).
 *
 * DOMAIN (§8 — stability control): X = ship state vector; P/N are one
 * Euler-stepped flow each, N projected onto the constraint set C.
 *
 * STELLAR READING: a star is P (radiation pressure, expansion) vs N
 * (gravity, collapse). Its lifecycle emerges from Q = ½[P,N] — the
 * accessible states (main sequence → giant → collapse) reachable only
 * through their interplay, never by either alone. δ is the imbalance
 * that selects the phase.  The ship is the same algebra.
 * ═════════════════════════════════════════════════════════════════════════
 */

const EPS = 1e-9;
const TAU = 2 * Math.PI;

// ── Constraint set C (§8) — declared constructor parameters ──────────────────
const V_MAX     = 130;   // speed cap (structural)
const T_MAX     = 1.0;   // thermal cap
const AV_MAX    = 2.8;   // angular velocity cap

// ── Flow rates (declared gains, NOT discovered constants — §7) ───────────────
const THRUST_RATE   = 15;    // P-linear: accel units/s² per unit g_P
const DRAG_RATE     = 0.55;   // N-linear: decel/s per unit g_N (vacuum floor)
const HEAT_GEN      = 0.06;   // P: thermal generation per unit g_P
const HEAT_RAD      = 0.03;   // N: thermal radiation per unit g_N
const ANG_P_RATE    = 2.4;    // P-angular: rad/s² per unit engaged gain
const G_ANG_APPLY   = 5.0;    // γ for angular P (how fast stick engages g_P_ang)
const G_ANG_RELEASE = 2.4;    // r for angular P (release when stick centers / brake)
const ANG_N_BASE    = 0.0;    // N-angular vacuum damp (0 = true angular momentum)
const ANG_N_ATMO    = 1.8;    // N-angular atmospheric damp

// ── Engaged-gain dynamics (§2.1) ─────────────────────────────────────────────
const G_P_APPLY     = 2.4;    // γ_P max (how fast throttle engages g_P)
const G_P_RELEASE   = 0.06;   // r_P when throttle eases
const G_N_APPLY_MAX = 3.2;    // γ_N max from the control law
const G_N_RELEASE   = 0.05;   // r_N when |δ| dwells below δ_soft
const DWELL          = 0.6;   // seconds below δ_soft before release fires

// ── Control-law band (§6) — declared, not derived ────────────────────────────
const DELTA_MIN     = 0.04;   // stasis floor  (|δ| → here ⇒ dither / Genesis)
const DELTA_SOFT_LO = 0.12;   // low dither onset
const DELTA_SOFT    = 0.62;   // restraint onset
const DELTA_MAX     = 0.92;   // rupture ceiling (|δ| → here ⇒ N at full)

// ── Commutator contribution (how much Q feeds rendered motion) ───────────────
const Q_GAIN        = 1.0;

// ── Saturating ramp σ (§6.2): σ(x≤0)=0, σ(x≥1)=1, linear between ─────────────
function sigma(x) { return Math.max(0, Math.min(1, x)); }

// ── Heading basis: ship forward = −Z local ──────────────────────────────────
function headingVec(yaw, pitch) {
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return [-Math.sin(yaw) * cp, sp, -Math.cos(yaw) * cp];
}

export function createRADState() {
  return {
    // State X — position, orientation, velocities
    px: 0, py: 0, pz: 0,
    vx: 0, vy: 0, vz: 0,
    yaw: 0, pitch: 0, roll: 0,
    angVelYaw: 0, angVelPitch: 0, angVelRoll: 0,
    hullTemp: 0,

    // Engaged gains (§2.1) — operator memory
    g_P: 0, g_N: 0,
    g_P_yaw: 0, g_P_pitch: 0, g_P_roll: 0,
    dwellTimer: 0,

    // Atmosphere (set externally by SpaceCanvas3D)
    atmoDepth: 0, atmoHeat: 0, atmoDrag: 1.0, atmoTurb: 0,

    // Telemetry
    P_mag: 0, N_mag: 0, Q_mag: 0, delta: 0, absDelta: 0,
    speed: 0, throttleDisplay: 0, omegaDisplay: 0.5,
    fieldIntegrity: 1.0, daastState: 'nexus', heading: 0,
    // legacy-compatible aliases the HUD reads
    dOmega_fwd: 0, dOmega_yaw: 0, dOmega_pitch: 0, dOmega_roll: 0, accum_fwd: 0,
  };
}

// ── P operator (§1, §8): one Euler-stepped generative flow on velocity ──────
//   P(v) = v + Δt · g_P · f_P,   f_P = heading · THRUST_RATE   (independent of v)
function flowP(vx, vy, vz, gP, hx, hy, hz, dt) {
  return [
    vx + dt * gP * hx * THRUST_RATE,
    vy + dt * gP * hy * THRUST_RATE,
    vz + dt * gP * hz * THRUST_RATE,
  ];
}

// ── N operator (§1, §8): one Euler-stepped constraining flow, projected to C ─
//   f_N(v) = −v̂ · DRAG_RATE · atmoDrag · |v|     (drag opposes velocity)
//   N(v) = proj_C( v + Δt · g_N · f_N(v) )
function flowN(vx, vy, vz, gN, atmoDrag, dt) {
  const sp = Math.sqrt(vx*vx + vy*vy + vz*vz);
  if (sp < EPS) return [vx, vy, vz];
  const decel = Math.min(sp, dt * gN * DRAG_RATE * atmoDrag * sp);
  const k = decel / sp;
  return [vx - vx*k, vy - vy*k, vz - vz*k];
}
function projectC(vx, vy, vz) {
  const sp = Math.sqrt(vx*vx + vy*vy + vz*vz);
  if (sp > V_MAX) { const s = V_MAX / sp; return [vx*s, vy*s, vz*s]; }
  return [vx, vy, vz];
}

/**
 * Carter RAD v10 step.
 * input: { thrust∈[0,1], yaw∈[-1,1], pitch∈[-1,1], roll∈[-1,1], brake∈{0,1} }
 * sensitivity: { pitch, yaw, roll } ∈ [0.05,1] — mobile default very low.
 */
export function radStep(state, input, dt, sensitivity = { pitch: 0.10, yaw: 0.10, roll: 0.10 }) {
  const dT = Math.min(Math.max(dt, 1/240), 0.033);
  const s = { ...state };

  const sv = typeof sensitivity === "object" ? sensitivity : { pitch: sensitivity, yaw: sensitivity, roll: sensitivity };
  const cl = v => Math.max(0.05, Math.min(1.0, v ?? 0.10));

  // input smoothing (mobile anti-jitter)
  if (s.smoothInput === undefined) s.smoothInput = { thrust: 0, yaw: 0, pitch: 0, roll: 0, brake: 0 };
  const si = s.smoothInput, sm = 0.30;
  si.thrust = si.thrust + ((input.thrust || 0) - si.thrust) * sm;
  si.yaw    = si.yaw    + ((input.yaw    || 0) - si.yaw)    * sm;
  si.pitch  = si.pitch  + ((input.pitch  || 0) - si.pitch)  * sm;
  si.roll   = si.roll   + ((input.roll   || 0) - si.roll)   * sm;
  si.brake  = input.brake ? 1 : 0;

  const thrust = Math.max(0, Math.min(1, si.thrust));
  const yawIn   = Math.max(-1, Math.min(1, si.yaw   * cl(sv.yaw)));
  const pitchIn = Math.max(-1, Math.min(1, si.pitch * cl(sv.pitch)));
  const rollIn  = Math.max(-1, Math.min(1, si.roll  * cl(sv.roll)));
  const brake   = si.brake;

  const atmoDrag = s.atmoDrag ?? 1.0;
  const atmoDamp = s.atmoDepth ?? 0;

  // ── 1. ENGAGED GAINS (§2.1) ──────────────────────────────────────────────
  // g_P: apply from throttle, release when throttle eases.
  const gP_apply = thrust * G_P_APPLY;
  const gP_rel   = (1 - thrust) * G_P_RELEASE;
  s.g_P = Math.max(0, s.g_P + dT * gP_apply);
  s.g_P *= (1 - gP_rel * dT * 60 * 0.016 * 60); // gentle bleed proportional to ease
  s.g_P = Math.min(1.4, s.g_P);

  // g_N: passive atmospheric drag is always partially engaged; the control
  // law (§6.2) adds continuous restraint as |δ| → δ_max.
  const passiveN = atmoDamp * 1.0;
  const ctrlGamma = G_N_APPLY_MAX * sigma((s.absDelta - DELTA_SOFT) / (DELTA_MAX - DELTA_SOFT));
  const gN_apply = passiveN + ctrlGamma;
  s.g_N = Math.max(0, s.g_N + dT * gN_apply);
  // release (§6.3): separate operation — fires after dwelling below δ_soft
  if (s.absDelta < DELTA_SOFT) {
    s.dwellTimer = (s.dwellTimer ?? 0) + dT;
    if (s.dwellTimer > DWELL) s.g_N *= (1 - G_N_RELEASE * dT * 60 * 0.016 * 60);
  } else {
    s.dwellTimer = 0;
  }
  s.g_N = Math.min(2.5, s.g_N);

  // ── 2. BALANCE δ (§3) — scalar reduction (Prop. 3) ───────────────────────
  const Pmag = s.g_P, Nmag = s.g_N;
  s.P_mag = Pmag; s.N_mag = Nmag;
  s.delta = (Pmag - Nmag) / (Pmag + Nmag + EPS);
  s.absDelta = Math.abs(s.delta);

  // ── 3. DAAST STATE (nexus / rupture / stasis) ─────────────────────────────
  if (s.absDelta >= DELTA_MAX) {
    s.daastState = 'rupture';
    s.fieldIntegrity = Math.max(0, s.fieldIntegrity - 0.04 * dT * 60);
  } else if (s.absDelta <= DELTA_MIN) {
    s.daastState = 'stasis';
  } else {
    s.daastState = 'nexus';
    s.fieldIntegrity = Math.min(1, s.fieldIntegrity + 0.002 * dT * 60);
  }

  // ── 4. THE COMMUTATOR Q = ½(PN − NP) on velocity (§4) ────────────────────
  //   Q_v = ½·Δt·g_N·( f_N(v) − f_N(v + Δt·g_P·f_P) )
  //   The emergent accessible motion from thrust+drag non-commutativity.
  const [hx, hy, hz] = headingVec(s.yaw, s.pitch);
  const vP = flowP(s.vx, s.vy, s.vz, s.g_P, hx, hy, hz, dT);   // P(v)
  const fN_v  = flowN(s.vx, s.vy, s.vz, 1, atmoDrag, 1);        // f_N(v) dir
  const fN_vP = flowN(vP[0], vP[1], vP[2], 1, atmoDrag, 1);     // f_N(P(v)) dir
  const Qvx = 0.5 * dT * s.g_N * (fN_v[0] - fN_vP[0]) * DRAG_RATE * atmoDrag;
  const Qvy = 0.5 * dT * s.g_N * (fN_v[1] - fN_vP[1]) * DRAG_RATE * atmoDrag;
  const Qvz = 0.5 * dT * s.g_N * (fN_v[2] - fN_vP[2]) * DRAG_RATE * atmoDrag;
  s.Q_mag = Math.sqrt(Qvx*Qvx + Qvy*Qvy + Qvz*Qvz);

  // ── 5. APPLY P then N, then add the rendered commutator Q (§4, §8) ────────
  //   v ← proj_C( N( P(v) ) )  +  Q_GAIN · Q_v
  let [vx, vy, vz] = flowP(s.vx, s.vy, s.vz, s.g_P, hx, hy, hz, dT);   // P
  [vx, vy, vz] = flowN(vx, vy, vz, s.g_N, atmoDrag, dT);               // N
  [vx, vy, vz] = projectC(vx, vy, vz);                                 // proj_C
  // rendered emergent motion
  vx += Q_GAIN * Qvx; vy += Q_GAIN * Qvy; vz += Q_GAIN * Qvz;
  [vx, vy, vz] = projectC(vx, vy, vz);

  // stasis dither removed — it injected random velocity at rest and caused
  // the ship to jitter/bounce. The DAAST "stasis" state label still shows.
  // atmospheric turbulence
  const turb = s.atmoTurb ?? 0;
  if (turb > 0.05) {
    vx += (Math.random() - 0.5) * turb * 0.4;
    vy += (Math.random() - 0.5) * turb * 0.3;
    vz += (Math.random() - 0.5) * turb * 0.4;
  }

  s.vx = vx; s.vy = vy; s.vz = vz;

  // ── 6. ANGULAR — engaged-gain P/N formalism (§2.1) ─────────────────────
  //   Stick deflection = γ (apply rate) for the angular P operator.
  //   g_P_ang accumulates while the stick is held; release (r) fires when
  //   the stick centers or brake is applied.  P(ω) = ω + Δt·g_P_ang·f_P.
  //   The angular velocity ω is the STATE — it persists in vacuum
  //   (N ≈ 0 ⇒ no auto-damp), exactly true angular momentum.
  const angEngage = (stick, g) => {
    const gamma = stick * G_ANG_APPLY;                 // signed apply rate
    let ng = g + dT * gamma;
    const r = (Math.abs(stick) < 0.02 ? G_ANG_RELEASE : 0) + (brake ? G_ANG_RELEASE * 4 : 0);
    ng *= (1 - Math.min(1, r * dT * 60 * 0.016 * 60));  // release
    return Math.max(-2.0, Math.min(2.0, ng));
  };
  s.g_P_yaw   = angEngage(yawIn,   s.g_P_yaw   ?? 0);
  s.g_P_pitch = angEngage(pitchIn, s.g_P_pitch ?? 0);
  s.g_P_roll  = angEngage(rollIn,  s.g_P_roll  ?? 0);

  // P operator: potentiate angular velocity via the engaged gain
  s.angVelYaw   += s.g_P_yaw   * ANG_P_RATE * dT;
  s.angVelPitch += s.g_P_pitch * ANG_P_RATE * dT;
  s.angVelRoll  += s.g_P_roll  * ANG_P_RATE * dT;

  // N operator: negate (damp) angular velocity — vacuum ⇒ none
  const angDamp = ANG_N_BASE + atmoDamp * ANG_N_ATMO + (brake ? 1.6 : 0);
  if (angDamp > 0) {
    const k = 1 - Math.min(1, angDamp * dT);
    s.angVelYaw   *= k;
    s.angVelPitch *= k;
    s.angVelRoll  *= k;
  }
  s.angVelYaw   = Math.max(-AV_MAX, Math.min(AV_MAX, s.angVelYaw));
  s.angVelPitch = Math.max(-AV_MAX, Math.min(AV_MAX, s.angVelPitch));
  s.angVelRoll  = Math.max(-AV_MAX, Math.min(AV_MAX, s.angVelRoll));

  s.yaw   += s.angVelYaw   * dT;
  s.pitch += s.angVelPitch * dT;
  s.roll  += s.angVelRoll  * dT;
  // pitch wraps (full 360° loops allowed) — no clamp, so pulling back keeps
  // rotating indefinitely instead of stopping at vertical.
  s.pitch = ((s.pitch + Math.PI) % TAU + TAU) % TAU - Math.PI;
  s.roll  = ((s.roll + Math.PI) % TAU + TAU) % TAU - Math.PI;

  // ── 7. THERMAL — P generates, N radiates (§8 projection onto T_MAX) ──────
  const heatIn  = s.g_P * HEAT_GEN * (1 + atmoDamp * 0.8);
  const heatOut = s.g_N * HEAT_RAD + 0.01;
  s.hullTemp = Math.min(T_MAX, Math.max(0, s.hullTemp + (heatIn - heatOut) * dT * 60));
  if (s.hullTemp > 0.75) {
    s.fieldIntegrity = Math.max(0, s.fieldIntegrity - (s.hullTemp - 0.75) * 0.008 * dT * 60);
  }

  // ── 8. INTEGRATE POSITION ───────────────────────────────────────────────
  s.px += s.vx * dT * 60;
  s.py += s.vy * dT * 60;
  s.pz += s.vz * dT * 60;

  // ── 9. TELEMETRY ────────────────────────────────────────────────────────
  s.speed = Math.sqrt(s.vx*s.vx + s.vy*s.vy + s.vz*s.vz);
  s.throttleDisplay = thrust;
  s.omegaDisplay = s.delta;            // HUD "Ω INDEX" now shows δ balance
  s.heading = getHeading(s.yaw);
  // legacy aliases for HUD ΔΩ block (now P/N/Q/δ)
  s.dOmega_fwd   = s.P_mag;
  s.dOmega_yaw   = s.N_mag;
  s.dOmega_pitch = s.Q_mag;
  s.dOmega_roll  = s.delta;
  s.accum_fwd    = s.g_N;

  return s;
}

export function getHeading(yaw) {
  return (((-yaw * 180 / Math.PI) % 360) + 360) % 360;
}

export { EPS };