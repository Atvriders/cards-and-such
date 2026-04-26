import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Spring Jump: Set spring tension (power). Release to jump. Score by distance. 10 attempts.
export const TOTAL_JUMPS = 10;
export interface SpringJumpSettings { dummy: boolean; }

export interface SpringJumpState {
  rngSeed: number;
  winds: number[];
  jumpIndex: number;
  tension: number;
  results: { distance: number; pts: number }[];
  score: number;
  phase: "aiming" | "jumped" | "done";
}

export type SpringJumpAction = { type: "setTension"; value: number } | { type: "jump" } | { type: "next" };

export function initialState(seed: number, settings: SpringJumpSettings): SpringJumpState {
  const rng = mulberry32(seed);
  const winds = Array.from({ length: TOTAL_JUMPS }, () => (rng() - 0.5) * 30);
  return { rngSeed: seed, winds, jumpIndex: 0, tension: 50, results: [], score: 0, phase: "aiming" };
}

export function reducer(state: SpringJumpState, action: SpringJumpAction): SpringJumpState {
  if (action.type === "setTension" && state.phase === "aiming") {
    return { ...state, tension: Math.max(1, Math.min(100, action.value)) };
  }
  if (action.type === "jump" && state.phase === "aiming") {
    const wind = state.winds[state.jumpIndex] ?? 0;
    // Ideal tension = 75, sweet spot gives best distance
    const base = state.tension * 1.2;
    const penalty = Math.abs(state.tension - 75) * 0.3;
    const distance = Math.max(0, base - penalty + wind * 0.1);
    const pts = Math.round(Math.min(100, distance));
    const results = [...state.results, { distance, pts }];
    const score = state.score + pts;
    const done = state.jumpIndex + 1 >= TOTAL_JUMPS;
    return { ...state, results, score, phase: done ? "done" : "jumped" };
  }
  if (action.type === "next" && state.phase === "jumped") {
    return { ...state, jumpIndex: state.jumpIndex + 1, phase: "aiming" };
  }
  return state;
}

export function isTerminal(state: SpringJumpState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
