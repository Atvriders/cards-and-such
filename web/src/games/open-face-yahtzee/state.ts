import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 5;
export const PAYOUTS: number[] = [40, 25, 50, 0];
export const CHOICES: string[] = ["Straight Run (+40)", "Three Pair (+25)", "Quad (+50)", "Bust (0)"];
export interface OpenFaceYahtzeeSettings { dummy: boolean; }
export interface OpenFaceYahtzeeState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type OpenFaceYahtzeeAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const sd=[...dice].sort((a,b)=>a-b); const counts=[0,0,0,0,0,0,0]; for(const x of dice){counts[x]=(counts[x]??0)+1;} const m=Math.max(...counts); if(m>=4) return 2; const sj=sd.join(","); if(sj==="1,2,3,4,5"||sj==="2,3,4,5,6") return 0; const pairs=counts.filter(c=>c===2).length; if(pairs>=2) return 1; return 3; }
export function initialState(seed: number, _settings: OpenFaceYahtzeeSettings): OpenFaceYahtzeeState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: OpenFaceYahtzeeState, action: OpenFaceYahtzeeAction): OpenFaceYahtzeeState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const resultIdx = classify(dice);
    const win = action.choice === resultIdx;
    const payout = win ? (PAYOUTS[resultIdx] ?? 0) : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, prediction: action.choice, dice, resultIdx, score: state.score + payout, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, dice: [], resultIdx: null, phase: "predict" };
  }
  return state;
}
export function isTerminal(state: OpenFaceYahtzeeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
