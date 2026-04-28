import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface DicePinballSettings { dummy: boolean; }
export interface DicePinballState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null; // last roll
  multiplier: number;
  score: number;
  history: number[];
  phase: "idle" | "result" | "done";
}
export type DicePinballAction = { type: "launch" } | { type: "next" };
export function initialState(seed: number, _s: DicePinballSettings): DicePinballState {
  return { rngSeed: seed, round: 1, dice: null, multiplier: 1, score: 0, history: [], phase: "idle" };
}
export function reducer(state: DicePinballState, action: DicePinballAction): DicePinballState {
  if (state.phase === "done") return state;
  if (action.type === "launch") {
    if (state.phase !== "idle") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const next = Math.floor(rng() * 2 ** 31);
    // bumpers: doubles double, sum >= 10 +1.5x, sum <= 4 +0.5x else 1x
    let mult = 1;
    if (a === b) mult = 2;
    else if (a + b >= 10) mult = 1.5;
    else if (a + b <= 4) mult = 0.5;
    const points = Math.round((a + b) * 5 * mult);
    return { ...state, rngSeed: next, dice: [a, b], multiplier: mult, score: state.score + points, history: [...state.history, points], phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    return { ...state, round: state.round + 1, dice: null, multiplier: 1, phase: "idle" };
  }
  return state;
}
export function isTerminal(state: DicePinballState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
