import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 2;
export const PAYOUTS: number[] = [50, 25, 10];
export const CHOICES: string[] = ["Mexico! (2-1) (+50)", "Doubles (+25)", "Other (+10)"];
export interface MexicanPubDiceSettings { dummy: boolean; }
export interface MexicanPubDiceState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type MexicanPubDiceAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { if(dice.includes(2) && dice.includes(1) && dice[0]!==dice[1]) return 0; if(dice[0]===dice[1]) return 1; return 2; }
export function initialState(seed: number, _settings: MexicanPubDiceSettings): MexicanPubDiceState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: MexicanPubDiceState, action: MexicanPubDiceAction): MexicanPubDiceState {
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
export function isTerminal(state: MexicanPubDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
