import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 3;
export const PAYOUTS: number[] = [30, 10, 18];
export const CHOICES: string[] = ["Top Tier (15+) (+30)", "Middle (10-14) (+10)", "Bottom (3-9) (+18)"];
export interface TumblinFlickSettings { dummy: boolean; }
export interface TumblinFlickState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type TumblinFlickAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const sum=dice.reduce((a,b)=>a+b,0); if(sum>=15) return 0; if(sum>=10) return 1; return 2; }
export function initialState(seed: number, _settings: TumblinFlickSettings): TumblinFlickState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: TumblinFlickState, action: TumblinFlickAction): TumblinFlickState {
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
export function isTerminal(state: TumblinFlickState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
