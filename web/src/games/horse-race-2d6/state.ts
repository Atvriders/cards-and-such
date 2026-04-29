import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 2;
export const PAYOUTS: number[] = [8, 18, 45];
export const CHOICES: string[] = ["Horse 7 (modal) (+8)", "Horse 5 or 9 (mid) (+18)", "Horse 2/12 (long) (+45)"];
export interface HorseRace2d6Settings { dummy: boolean; }
export interface HorseRace2d6State {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type HorseRace2d6Action = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const sum=dice.reduce((a,b)=>a+b,0); if(sum===7) return 0; if(sum===5||sum===9) return 1; if(sum===2||sum===12) return 2; return -1; }
export function initialState(seed: number, _settings: HorseRace2d6Settings): HorseRace2d6State {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: HorseRace2d6State, action: HorseRace2d6Action): HorseRace2d6State {
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
export function isTerminal(state: HorseRace2d6State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
