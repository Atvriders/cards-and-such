import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_TURNS = 10;
export interface DiceCheckersSettings { dummy: boolean; }
export interface DiceCheckersState { rngSeed: number; turn: number; captures: number; score: number; phase: "rolling" | "scored" | "done"; lastRoll: number | null; lastCapture: boolean; }
export type DiceCheckersAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: DiceCheckersSettings): DiceCheckersState {
  return { rngSeed: seed, turn: 1, captures: 0, score: 0, phase: "rolling", lastRoll: null, lastCapture: false };
}
export function reducer(state: DiceCheckersState, action: DiceCheckersAction): DiceCheckersState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng()*2**31);
    const capture = r >= 5;
    const isLast = state.turn >= TOTAL_TURNS;
    return { ...state, rngSeed: nextSeed, captures: state.captures + (capture ? 1 : 0), score: state.score + (capture ? 30 : 5), phase: isLast ? "done" : "scored", lastRoll: r, lastCapture: capture };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, turn: state.turn + 1, phase: "rolling", lastRoll: null, lastCapture: false };
  }
  return state;
}
export function isTerminal(s: DiceCheckersState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
