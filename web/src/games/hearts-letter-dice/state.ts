import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 5;
export const PAYOUTS: number[] = [25, 35, 15, 0];
export const CHOICES: string[] = ["H-E (1+2) (+25)", "A-R-T (3+4+5) (+35)", "S (6) only (+15)", "Bust (0)"];
export interface HeartsLetterDiceSettings { dummy: boolean; }
export interface HeartsLetterDiceState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: number[];
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type HeartsLetterDiceAction = { type: "predict"; choice: number } | { type: "next" };
export function classify(dice: number[]): number { const counts=[0,0,0,0,0,0,0]; for(const x of dice){counts[x]=(counts[x]??0)+1;} const has1=(counts[1]??0)>=1, has2=(counts[2]??0)>=1, has3=(counts[3]??0)>=1, has4=(counts[4]??0)>=1, has5=(counts[5]??0)>=1, has6=(counts[6]??0)>=1; if(has3 && has4 && has5) return 1; if(has1 && has2) return 0; if(has6 && !has1 && !has2 && !has3 && !has4 && !has5) return 2; return 3; }
export function initialState(seed: number, _settings: HeartsLetterDiceSettings): HeartsLetterDiceState {
  return { rngSeed: seed, round: 1, prediction: null, dice: [], resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: HeartsLetterDiceState, action: HeartsLetterDiceAction): HeartsLetterDiceState {
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
export function isTerminal(state: HeartsLetterDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
