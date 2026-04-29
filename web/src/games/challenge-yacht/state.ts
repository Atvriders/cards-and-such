import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const PAYOUTS: number[] = [40,15,10];
export const CHOICES: string[] = ["Doubles (+40)","High Roll (+15)","Low Roll (+10)"];
export interface ChallengeYachtSettings { dummy: boolean; }
export interface ChallengeYachtState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type ChallengeYachtAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: ChallengeYachtSettings): ChallengeYachtState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: ChallengeYachtState, action: ChallengeYachtAction): ChallengeYachtState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const resultIdx = (()=>{ if (a === b) return 0; if (a + b >= 9) return 1; return 2; })();
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
export function isTerminal(state: ChallengeYachtState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
