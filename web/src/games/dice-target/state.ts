import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Target: Roll 3 dice. Aim for sum = 12. 10 rounds.
// Score: 100 - 8*|sum-12|, floored at 0.

export const TOTAL_ROUNDS = 10;
export const TARGET = 12;

export interface DiceTargetSettings { dummy: boolean; }

export interface DiceTargetState {
  rngSeed: number;
  round: number;
  dice: [number, number, number] | null;
  sum: number;
  score: number;
  lastPts: number;
  phase: "rolling" | "scored" | "done";
}

export type DiceTargetAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceTargetSettings): DiceTargetState {
  return { rngSeed: seed, round: 1, dice: null, sum: 0, score: 0, lastPts: 0, phase: "rolling" };
}

export function scoreForSum(sum: number): number {
  return Math.max(0, 100 - 8 * Math.abs(sum - TARGET));
}

export function reducer(state: DiceTargetState, action: DiceTargetAction): DiceTargetState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b + c;
    const pts = scoreForSum(sum);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b, c], sum, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: null, sum: 0, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceTargetState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
