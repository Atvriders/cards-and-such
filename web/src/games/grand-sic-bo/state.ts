import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const PAYOUTS: number[] = [18,18,150];
export const CHOICES: string[] = ["Small 4-10 (+18)","Big 11-17 (+18)","Triple (+150)"];
export interface GrandSicBoSettings { dummy: boolean; }
export interface GrandSicBoState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type GrandSicBoAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: GrandSicBoSettings): GrandSicBoState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: GrandSicBoState, action: GrandSicBoAction): GrandSicBoState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6); const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const resultIdx = (()=>{ if (a===b&&b===c) return 2; const s=a+b+c; if (s<=10) return 0; return 1; })();
    const win = action.choice === resultIdx;
    const payout = win ? (PAYOUTS[resultIdx] ?? 0) : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, dice: [a,b,c], resultIdx, score: state.score + payout, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, dice: null, resultIdx: null, phase: "predict" };
  }
  return state;
}
export function isTerminal(state: GrandSicBoState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
