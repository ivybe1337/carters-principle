// Core state-transition engine
// Taurus 6D³ correction constant
const TAU_CORRECTION = 1.61803398875;
const CRITICAL_THRESHOLD = 100.0;

export function createRadState() {
  return {
    ratio_a: 0.5,
    ratio_b: 0.5,
    alpha: 0.0,
    beta: 0.0,
    theta: 0.0,
    resonance: 0.0,
    stability: 100.0,
    breakEvent: false,
  };
}

export function radEngineStep(state, excitationAlpha, excitationBeta) {
  const s = { ...state, breakEvent: false };

  // Step A: Asymmetry Modulation
  s.ratio_a += excitationAlpha * 0.008 * TAU_CORRECTION;
  s.ratio_b += excitationBeta * 0.008 * TAU_CORRECTION;
  s.ratio_a = Math.max(0.0, Math.min(1.0, s.ratio_a));
  s.ratio_b = Math.max(0.0, Math.min(1.0, s.ratio_b));

  // Step B: Manifold Displacement
  const slope = s.ratio_b - s.ratio_a;
  s.alpha += slope * Math.cos(s.theta) * excitationAlpha * TAU_CORRECTION;
  s.beta += slope * Math.sin(s.theta) * excitationBeta * TAU_CORRECTION;
  s.theta += (excitationBeta - excitationAlpha) * 0.045;

  // Step C: Resonance Accumulation
  const delta = s.ratio_b - s.ratio_a;
  if (excitationAlpha === 0 && excitationBeta === 0) {
    s.resonance = Math.max(0.0, s.resonance - 0.12);
  } else {
    s.resonance += (delta * delta) * 1.8 + excitationAlpha * 0.15;
  }

  // Step D: Stability
  s.stability = CRITICAL_THRESHOLD - s.resonance;
  if (s.stability < 0.0) {
    s.stability = 0.0;
    s.breakEvent = true;
  }

  return s;
}

// Translation bridge: RAD state → classical physics display values
export function translateToPhysics(state) {
  const dX = state.alpha * 11.25;
  const dY = state.beta * 11.25;
  const comX = (state.ratio_a - 0.5) * 24.0;
  const comY = (state.ratio_b - 0.5) * 24.0;
  const coreHeat = (state.resonance / CRITICAL_THRESHOLD) * 100.0;
  const thermalWarning = coreHeat >= 85;

  return { dX, dY, comX, comY, coreHeat, thermalWarning };
}

export { CRITICAL_THRESHOLD };