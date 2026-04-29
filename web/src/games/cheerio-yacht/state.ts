import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const PAYOUTS: number[] = [30,25,10];
export const CHOICES: string[] = ["Pair (+30)","Run (+25)","Mixed (+10)"];
export interface CheerioYachtSettings { dummy: boolean; }
export interface CheerioYachtState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type CheerioYachtAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: CheerioYachtSettings): CheerioYachtState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: CheerioYachtState, action: CheerioYachtAction): CheerioYachtState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const resultIdx = (()=>{ if (a === b) return 0; if (Math.abs(a-b) === 1) return 1; return 2; })();
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
export function isTerminal(state: CheerioYachtState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
