import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const PAYOUTS: number[] = [30,18,8];
export const CHOICES: string[] = ["Exactly 7 (+30)","Near 7 (+18)","Far from 7 (+8)"];
export interface SevensDiceSettings { dummy: boolean; }
export interface SevensDiceState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type SevensDiceAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: SevensDiceSettings): SevensDiceState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: SevensDiceState, action: SevensDiceAction): SevensDiceState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const resultIdx = (()=>{ const s=a+b; if (s===7) return 0; if (s===6||s===8) return 1; return 2; })();
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
export function isTerminal(state: SevensDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
