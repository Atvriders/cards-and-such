import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Pyramid: Roll 6 dice (one big roll). Sum them.
// Pyramid scoring: a "low" pyramid (small numbers on top) scores more.
// Score: 200 - 5 * sum, floored at 0. Plus bonus for any pip = 1 (+10 each).
// Single roll = single round (the "build" is the layout).

export const TOTAL_ROUNDS = 6;

export interface DicePyramidSettings { dummy: boolean; }

export interface DicePyramidState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  sum: number;
  ones: number;
  score: number;
  lastPts: number;
  phase: "rolling" | "scored" | "done";
}

export type DicePyramidAction = { type: "roll" } | { type: "next" };

export function pyramidScore(dice: number[]): { pts: number; sum: number; ones: number } {
  const sum = dice.reduce((a, b) => a + b, 0);
  const ones = dice.filter(d => d === 1).length;
  const base = Math.max(0, 200 - 5 * sum);
  const bonus = ones * 10;
  return { pts: base + bonus, sum, ones };
}

export function initialState(seed: number, _settings: DicePyramidSettings): DicePyramidState {
  return { rngSeed: seed, round: 1, dice: null, sum: 0, ones: 0, score: 0, lastPts: 0, phase: "rolling" };
}

export function reducer(state: DicePyramidState, action: DicePyramidAction): DicePyramidState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < 6; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { pts, sum, ones } = pyramidScore(dice);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, sum, ones, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: null, sum: 0, ones: 0, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DicePyramidState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
