import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const PAYOUTS: number[] = [12,12,16];
export const CHOICES: string[] = ["Red (even sum) (+12)","Black (odd sum) (+12)","Low 2-6 (+16)"];
export interface DicelandRouletteSettings { dummy: boolean; }
export interface DicelandRouletteState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type DicelandRouletteAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: DicelandRouletteSettings): DicelandRouletteState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: DicelandRouletteState, action: DicelandRouletteAction): DicelandRouletteState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const s = a+b;
    const isLow = s>=2 && s<=6;
    const win = (action.choice===0 && s%2===0) || (action.choice===1 && s%2===1) || (action.choice===2 && isLow);
    const resultIdx = win ? action.choice : ((s%2===0) ? 0 : 1);
    const payout = win ? (PAYOUTS[action.choice] ?? 0) : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, dice: [a,b], resultIdx, score: state.score + payout, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, dice: null, resultIdx: null, phase: "predict" };
  }
  return state;
}
export function isTerminal(state: DicelandRouletteState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
