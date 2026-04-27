import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice 21: 5 rounds. Each round, roll a die one at a time. Sum to as close to 21 as possible.
// Bust over 21: 0 points. Otherwise, points = sum (so closer to 21 is better).
// Bonus: if exactly 21, +50 extra.

export const TOTAL_ROUNDS = 5;

export interface Dice21Settings { dummy: boolean; }

export interface Dice21State {
  rngSeed: number;
  round: number;
  rolls: number[];
  sum: number;
  totalScore: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
  busted: boolean;
}

export type Dice21Action = { type: "roll" } | { type: "stand" } | { type: "next" };

export function initialState(seed: number, _settings: Dice21Settings): Dice21State {
  return { rngSeed: seed, round: 1, rolls: [], sum: 0, totalScore: 0, phase: "rolling", lastPts: 0, busted: false };
}

export function reducer(state: Dice21State, action: Dice21Action): Dice21State {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newSum = state.sum + r;
    const rolls = [...state.rolls, r];
    if (newSum > 21) {
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: nextSeed, rolls, sum: newSum, phase: isLast ? "done" : "scored", lastPts: 0, busted: true };
    }
    if (newSum === 21) {
      const pts = 21 + 50;
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: nextSeed, rolls, sum: newSum, totalScore: state.totalScore + pts, phase: isLast ? "done" : "scored", lastPts: pts, busted: false };
    }
    return { ...state, rngSeed: nextSeed, rolls, sum: newSum };
  }
  if (action.type === "stand") {
    if (state.phase !== "rolling") return state;
    const pts = state.sum;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, totalScore: state.totalScore + pts, phase: isLast ? "done" : "scored", lastPts: pts, busted: false };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, rolls: [], sum: 0, phase: "rolling", lastPts: 0, busted: false };
  }
  return state;
}

export function isTerminal(state: Dice21State): { score: number } | null {
  return state.phase === "done" ? { score: state.totalScore } : null;
}
