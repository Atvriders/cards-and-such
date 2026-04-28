import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const NUM_DICE = 3;

export interface DiceFarmSettings { dummy: boolean; }

export interface DiceFarmState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "scored" | "done";
}

export type DiceFarmAction = { type: "roll" } | { type: "next" };

export function scoreDice(dice: number[]): number {
  return dice.filter(d=>d===6).length * 10;
}

export function initialState(seed: number, _settings: DiceFarmSettings): DiceFarmState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll" };
}

export function reducer(state: DiceFarmState, action: DiceFarmAction): DiceFarmState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < NUM_DICE; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreDice(dice);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll" };
  }
  return state;
}

export function isTerminal(state: DiceFarmState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
