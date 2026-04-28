import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceCourtroomSettings { dummy: boolean; }
export interface DiceCourtroomState {
  rngSeed: number;
  round: number;
  dice: number[];
  sum: number;
  score: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
}
export type DiceCourtroomAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DiceCourtroomSettings): DiceCourtroomState {
  return { rngSeed: seed, round: 1, dice: [], sum: 0, score: 0, phase: "rolling", lastPts: 0 };
}
export function reducer(state: DiceCourtroomState, action: DiceCourtroomAction): DiceCourtroomState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = [1+Math.floor(rng()*6),1+Math.floor(rng()*6),1+Math.floor(rng()*6),1+Math.floor(rng()*6),1+Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = dice.reduce((a,b)=>a+b,0);
    const pts = (sum >= 18 && sum <= 25) ? 25 : ((sum >= 13 && sum <= 17) || (sum >= 26 && sum <= 28)) ? 12 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, sum, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [], sum: 0, phase: "rolling", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: DiceCourtroomState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
