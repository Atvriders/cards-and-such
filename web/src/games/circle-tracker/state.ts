import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Circle Tracker: stimuli appear; react when condition is met.
// 30 ticks total. Each tick a target appears with a color (or symbol).
// Click during a "go" tick to score; click during "no-go" tick to miss.

export const TIMER_TICKS = 30;

export interface CircleTrackerSettings { dummy: boolean; }

export interface CircleTrackerState {
  rngSeed: number;
  ticksRemaining: number;
  isGo: boolean;     // is current target a "go" stimulus?
  hasReactedThisTick: boolean;
  score: number;
  hits: number;
  misses: number;
  phase: "playing" | "done";
}

export type CircleTrackerAction =
  | { type: "tick" }
  | { type: "react" };

export function initialState(seed: number, _settings: CircleTrackerSettings): CircleTrackerState {
  const rng = mulberry32(seed);
  const isGo = rng() < 0.5;
  const seed2 = Math.floor(rng() * 2 ** 31);
  return { rngSeed: seed2, ticksRemaining: TIMER_TICKS, isGo, hasReactedThisTick: false, score: 0, hits: 0, misses: 0, phase: "playing" };
}

export function reducer(state: CircleTrackerState, action: CircleTrackerAction): CircleTrackerState {
  if (state.phase === "done") return state;
  if (action.type === "react") {
    if (state.hasReactedThisTick) return state;
    if (state.isGo) {
      return { ...state, score: state.score + 10, hits: state.hits + 1, hasReactedThisTick: true };
    }
    return { ...state, score: Math.max(0, state.score - 5), misses: state.misses + 1, hasReactedThisTick: true };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const isGo = rng() < 0.5;
    const seed2 = Math.floor(rng() * 2 ** 31);
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, isGo, hasReactedThisTick: false, ticksRemaining, phase };
  }
  return state;
}

export function isTerminal(state: CircleTrackerState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
