import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 13;
export const DICE_COUNT = 2;
export const PAYOUTS: number[] = [60, 20, 12, 5];
export const CHOICES: string[] = ["Meyer (2-1 'Mia') (+60)", "Pair (+20)", "High (sum 9-12) (+12)", "Low (rest) (+5)"];
export interface MeyerBluffSettings { dummy: boolean; }
export interface MeyerBluffState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type MeyerBluffAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { if(dice.includes(2) && dice.includes(1) && dice[0]!==dice[1]) return 0; if(dice[0]===dice[1]) return 1; const sum=dice.reduce((a,b)=>a+b,0); if(sum>=9) return 2; return 3; }
export function initialState(seed: number, _settings: MeyerBluffSettings): MeyerBluffState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: MeyerBluffState, action: MeyerBluffAction): MeyerBluffState {
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
export function isTerminal(state: MeyerBluffState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
