import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const PAYOUTS: number[] = [36,18,13,10,8,6,8,10,13,18,36];
export const CHOICES: string[] = ["Horse 2 (+36)","Horse 3 (+18)","Horse 4 (+13)","Horse 5 (+10)","Horse 6 (+8)","Horse 7 (+6)","Horse 8 (+8)","Horse 9 (+10)","Horse 10 (+13)","Horse 11 (+18)","Horse 12 (+36)"];
export interface HorseRaceDiceSettings { dummy: boolean; }
export interface HorseRaceDiceState {
  rngSeed: number;
  round: number;
  prediction: number | null;
  dice: [number, number] | null;
  resultIdx: number | null;
  score: number;
  phase: "predict" | "result" | "done";
}
export type HorseRaceDiceAction =
  | { type: "predict"; choice: number }
  | { type: "next" };
export function initialState(seed: number, _settings: HorseRaceDiceSettings): HorseRaceDiceState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, resultIdx: null, score: 0, phase: "predict" };
}
export function reducer(state: HorseRaceDiceState, action: HorseRaceDiceAction): HorseRaceDiceState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const resultIdx = (()=>{ return a+b-2; })();
    const win = action.choice === resultIdx;
    const payout = win ? (PAYOUTS[resultIdx] ?? 0) : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, dice: [a,b], resultIdx, score: state.score + payout, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, dice: null, resultIdx: null, phase: "predict" };
  }
  return state;
}
export function isTerminal(state: HorseRaceDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
