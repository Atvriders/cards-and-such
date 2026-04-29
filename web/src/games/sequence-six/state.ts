import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 13;
export const DICE_COUNT = 4;
export const PAYOUTS: number[] = [30, 30, 8];
export const CHOICES: string[] = ["Includes a 1-2-3 run (+30)", "Includes a 4-5-6 run (+30)", "No run (+8)"];
export interface SequenceSixSettings { dummy: boolean; }
export interface SequenceSixState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type SequenceSixAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const has=(v:number)=>dice.includes(v); if(has(1)&&has(2)&&has(3)) return 0; if(has(4)&&has(5)&&has(6)) return 1; return 2; }
export function initialState(seed: number, _settings: SequenceSixSettings): SequenceSixState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: SequenceSixState, action: SequenceSixAction): SequenceSixState {
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
export function isTerminal(state: SequenceSixState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
