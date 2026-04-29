import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const PAYOUTS: number[] = [50,25,6];
export const CHOICES: string[] = ["Schock (+50)","Straße (+25)","Plain (+6)"];
export interface SchockenPubSettings { dummy: boolean; }
export interface SchockenPubState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type SchockenPubAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: SchockenPubSettings): SchockenPubState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: SchockenPubState, action: SchockenPubAction): SchockenPubState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6); const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const resultIdx = (()=>{ const ones=[a,b,c].filter(x=>x===1).length; const sorted=[a,b,c].sort((x,y)=>x-y); const s0=sorted[0]!,s1=sorted[1]!,s2=sorted[2]!; const isStraight = (s1===s0+1 && s2===s1+1); if (ones===2) return 0; if (isStraight && ones<2) return 1; return 2; })();
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
export function isTerminal(state: SchockenPubState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
