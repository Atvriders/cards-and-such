import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 3;
export const PAYOUTS: number[] = [60, 15, 20];
export const CHOICES: string[] = ["Triples (+60)", "All Different (+15)", "One Pair (+20)"];
export interface Ludus12Settings { dummy: boolean; }
export interface Ludus12State {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type Ludus12Action = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const counts=[0,0,0,0,0,0,0]; for(const x of dice){counts[x]=(counts[x]??0)+1;} const m=Math.max(...counts); if(m===3) return 0; if(m===1) return 1; return 2; }
export function initialState(seed: number, _settings: Ludus12Settings): Ludus12State {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: Ludus12State, action: Ludus12Action): Ludus12State {
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
export function isTerminal(state: Ludus12State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
