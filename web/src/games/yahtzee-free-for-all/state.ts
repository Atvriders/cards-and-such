import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 13;
export const DICE_COUNT = 5;
export const PAYOUTS: number[] = [15, 30, 12, 0];
export const CHOICES: string[] = ["Aces Section (+15)", "Sixes Section (+30)", "Pairs Section (+12)", "Skip (0)"];
export interface YahtzeeFreeForAllSettings { dummy: boolean; }
export interface YahtzeeFreeForAllState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type YahtzeeFreeForAllAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const counts=[0,0,0,0,0,0,0]; for(const x of dice){counts[x]=(counts[x]??0)+1;} if((counts[1]??0)>=3) return 0; if((counts[6]??0)>=3) return 1; const pairs=counts.filter(c=>c>=2).length; if(pairs>=2) return 2; return 3; }
export function initialState(seed: number, _settings: YahtzeeFreeForAllSettings): YahtzeeFreeForAllState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: YahtzeeFreeForAllState, action: YahtzeeFreeForAllAction): YahtzeeFreeForAllState {
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
export function isTerminal(state: YahtzeeFreeForAllState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
