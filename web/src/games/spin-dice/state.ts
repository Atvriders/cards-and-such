import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const PAYOUTS: number[] = [80,40,18,0];
export const CHOICES: string[] = ["Solo (snake/box) (+80)","Pair (+40)","Run (+18)"];
export interface SpinDiceSettings { dummy: boolean; }
export interface SpinDiceState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type SpinDiceAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: SpinDiceSettings): SpinDiceState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: SpinDiceState, action: SpinDiceAction): SpinDiceState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const resultIdx = (()=>{ if ((a===1&&b===1)||(a===6&&b===6)) return 0; if (a===b) return 1; if (Math.abs(a-b)===1) return 2; return 3; })();
    const win = action.choice === resultIdx;
    const payout = win ? (PAYOUTS[resultIdx] ?? 0) : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, dice: [a,b], resultIdx, score: state.score + payout, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, dice: null, resultIdx: null, phase: "predict" };
  }
  return state;
}
export function isTerminal(state: SpinDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
