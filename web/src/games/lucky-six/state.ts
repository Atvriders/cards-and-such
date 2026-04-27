import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Lucky Six: roll 1 die 12 times. +20 per six.
export const TOTAL_ROLLS = 12;
export interface LuckySixSettings { dummy: boolean; }
export interface LuckySixState { rngSeed: number; roll: number; lastDie: number | null; sixes: number; score: number; phase: "rolling" | "result" | "done"; }
export type LuckySixAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: LuckySixSettings): LuckySixState {
  return { rngSeed: seed, roll: 1, lastDie: null, sixes: 0, score: 0, phase: "rolling" };
}
export function reducer(state: LuckySixState, action: LuckySixAction): LuckySixState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const d = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = d === 6;
    const pts = win ? 20 : 0;
    const isLast = state.roll >= TOTAL_ROLLS;
    return { ...state, rngSeed: nextSeed, lastDie: d, sixes: state.sixes + (win?1:0), score: state.score + pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, roll: state.roll + 1, lastDie: null, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: LuckySixState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
