import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_FLIPS = 20;
export interface DiceCoinFlipSettings { dummy: boolean; }
export interface DiceCoinFlipState { rngSeed: number; flipIdx: number; lastDie: number | null; lastHeads: boolean; lastWin: boolean; score: number; phase: "predict" | "result" | "done"; }
export type DiceCoinFlipAction = { type: "predict"; choice: "heads" | "tails" } | { type: "next" };
export function initialState(seed: number, _s: DiceCoinFlipSettings): DiceCoinFlipState {
  return { rngSeed: seed, flipIdx: 0, lastDie: null, lastHeads: false, lastWin: false, score: 0, phase: "predict" };
}
export function reducer(state: DiceCoinFlipState, action: DiceCoinFlipAction): DiceCoinFlipState {
  if (state.phase === "done") return state;
  if (action.type === "predict" && state.phase === "predict") {
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng()*2**31);
    const heads = die % 2 === 0;
    const win = (action.choice === "heads") === heads;
    const flipIdx = state.flipIdx + 1;
    const isLast = flipIdx >= TOTAL_FLIPS;
    return { ...state, rngSeed: nextSeed, flipIdx, lastDie: die, lastHeads: heads, lastWin: win, score: state.score + (win ? 5 : 0), phase: isLast ? "done" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, lastDie: null, phase: "predict" };
  }
  return state;
}
export function isTerminal(s: DiceCoinFlipState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
