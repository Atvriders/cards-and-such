import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const PAYOUTS: number[] = [20,20,200,0];
export const CHOICES: string[] = ["Big 14-16 (+20)","Small 5-7 (+20)","Aces (+200)"];
export interface BankaFrancescaSettings { dummy: boolean; }
export interface BankaFrancescaState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type BankaFrancescaAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: BankaFrancescaSettings): BankaFrancescaState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: BankaFrancescaState, action: BankaFrancescaAction): BankaFrancescaState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6); const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const resultIdx = (()=>{ if (a===1&&b===1&&c===1) return 2; const s=a+b+c; const triple=(a===b&&b===c); if (!triple && s>=14 && s<=16) return 0; if (!triple && s>=5 && s<=7) return 1; return 3; })();
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
export function isTerminal(state: BankaFrancescaState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
