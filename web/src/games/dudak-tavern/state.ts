import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 14;
export const DICE_COUNT = 3;
export const PAYOUTS: number[] = [50, 30, 30, 10];
export const CHOICES: string[] = ["Triple (+50)", "Run 1-2-3 (+30)", "Run 4-5-6 (+30)", "Other (+10)"];
export interface DudakTavernSettings { dummy: boolean; }
export interface DudakTavernState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type DudakTavernAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const sd=[...dice].sort((a,b)=>a-b); const counts=[0,0,0,0,0,0,0]; for(const x of dice){counts[x]=(counts[x]??0)+1;} if(Math.max(...counts)===3) return 0; const sj=sd.join(","); if(sj==="1,2,3") return 1; if(sj==="4,5,6") return 2; return 3; }
export function initialState(seed: number, _settings: DudakTavernSettings): DudakTavernState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: DudakTavernState, action: DudakTavernAction): DudakTavernState {
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
export function isTerminal(state: DudakTavernState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
