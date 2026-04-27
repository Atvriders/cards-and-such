import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_TURNS = 12;
export const BOARD = [10, 0, 25, 5, -10, 15, 0, 30, -5, 20, 0, 50]; // 12 squares with values
export interface DiceMonopolySettings { dummy: boolean; }
export interface DiceMonopolyState { rngSeed: number; turn: number; pos: number; score: number; phase: "rolling" | "scored" | "done"; lastRoll: number | null; lastValue: number; }
export type DiceMonopolyAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: DiceMonopolySettings): DiceMonopolyState {
  return { rngSeed: seed, turn: 1, pos: 0, score: 100, phase: "rolling", lastRoll: null, lastValue: 0 };
}
export function reducer(state: DiceMonopolyState, action: DiceMonopolyAction): DiceMonopolyState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng()*2**31);
    const pos = (state.pos + r) % BOARD.length;
    const v = BOARD[pos]!;
    const isLast = state.turn >= TOTAL_TURNS;
    return { ...state, rngSeed: nextSeed, pos, score: state.score + v, phase: isLast ? "done" : "scored", lastRoll: r, lastValue: v };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, turn: state.turn + 1, phase: "rolling", lastRoll: null, lastValue: 0 };
  }
  return state;
}
export function isTerminal(s: DiceMonopolyState): { score: number } | null { return s.phase==="done" ? { score: Math.max(0, s.score) } : null; }
