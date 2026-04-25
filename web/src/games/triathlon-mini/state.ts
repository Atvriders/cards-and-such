import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Triathlon Mini: three timed events — swim, bike, run
// Player taps button rhythmically to build and maintain speed

export type Event = "swim" | "bike" | "run";
export type Phase = "swim" | "bike" | "run" | "done";

export interface TriathlonState {
  rngSeed: number;
  phase: Phase;
  tick: number;
  eventTicks: number;    // ticks per event
  progress: number;      // 0-100 current event progress
  speed: number;         // current speed
  stamina: number;       // 0-100
  combo: number;         // consecutive good taps
  lastTapTick: number;   // tick of last tap (rhythm check)
  swimTime: number;
  bikeTime: number;
  runTime: number;
  score: number;
}

export type TriathlonAction =
  | { type: "tap" }
  | { type: "tick" };

const EVENT_TICKS = 120;
const IDEAL_TAP_INTERVAL = 12; // ticks between taps for rhythm bonus

export function initialState(seed: number): TriathlonState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    phase: "swim",
    tick: 0,
    eventTicks: EVENT_TICKS,
    progress: 0,
    speed: 1.0,
    stamina: 100,
    combo: 0,
    lastTapTick: 0,
    swimTime: 0,
    bikeTime: 0,
    runTime: 0,
    score: 0,
  };
}

export type TriathlonAction2 = TriathlonAction;

export function reducer(state: TriathlonState, action: TriathlonAction): TriathlonState {
  if (state.phase === "done") return state;

  if (action.type === "tap") {
    const interval = state.tick - state.lastTapTick;
    const rhythmic = interval >= IDEAL_TAP_INTERVAL - 3 && interval <= IDEAL_TAP_INTERVAL + 3;
    const newCombo = rhythmic ? state.combo + 1 : 0;
    const speedBoost = rhythmic ? 0.15 : 0.05;
    const staminaCost = 3;
    const newSpeed = Math.max(0.5, Math.min(4.0, state.speed + speedBoost));
    const newStamina = Math.max(0, state.stamina - staminaCost);
    return {
      ...state,
      speed: newSpeed,
      stamina: newStamina,
      combo: newCombo,
      lastTapTick: state.tick,
    };
  }

  // tick
  const newTick = state.tick + 1;
  const staminaRecovery = 0.3;
  const newStamina = Math.min(100, state.stamina + staminaRecovery);
  const staminaFactor = state.stamina > 40 ? 1.0 : 0.6;
  const speedDecay = 0.04;
  const newSpeed = Math.max(0.5, state.speed - speedDecay);
  const newProgress = Math.min(100, state.progress + newSpeed * staminaFactor);

  if (newProgress >= 100) {
    // event complete
    const elapsed = newTick;
    let swimTime = state.swimTime;
    let bikeTime = state.bikeTime;
    let runTime = state.runTime;

    if (state.phase === "swim") swimTime = elapsed;
    else if (state.phase === "bike") bikeTime = elapsed - swimTime;
    else if (state.phase === "run") runTime = elapsed - swimTime - bikeTime;

    const nextPhase: Phase =
      state.phase === "swim" ? "bike" :
      state.phase === "bike" ? "run" : "done";

    const eventScore = Math.round(100 - elapsed * 0.3);

    return {
      ...state,
      tick: newTick,
      phase: nextPhase,
      progress: 0,
      speed: 1.0,
      stamina: Math.min(100, newStamina + 20),
      combo: 0,
      swimTime,
      bikeTime,
      runTime,
      score: state.score + Math.max(0, eventScore),
    };
  }

  return {
    ...state,
    tick: newTick,
    progress: newProgress,
    speed: newSpeed,
    stamina: newStamina,
  };
}

export function isTerminal(state: TriathlonState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.min(100, state.score) };
}
