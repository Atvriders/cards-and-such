import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 3;
export const PAYOUTS: number[] = [50, 25, 5];
export const CHOICES: string[] = ["3-2-1 in order (+50)", "Any 3-2-1 set (+25)", "No 3-2-1 (+5)"];
export interface ThreeTwoOneDownSettings { dummy: boolean; }
export interface ThreeTwoOneDownState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type ThreeTwoOneDownAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const sd=[...dice].sort((a,b)=>a-b); if(dice[0]===3 && dice[1]===2 && dice[2]===1) return 0; if(sd.join(",")==="1,2,3") return 1; return 2; }
export function initialState(seed: number, _settings: ThreeTwoOneDownSettings): ThreeTwoOneDownState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: ThreeTwoOneDownState, action: ThreeTwoOneDownAction): ThreeTwoOneDownState {
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
export function isTerminal(state: ThreeTwoOneDownState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
