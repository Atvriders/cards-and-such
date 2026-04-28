import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 50;
export const DIE_COUNT = 3;
export const START_SCORE = 701;

export interface Dice701Settings { dummy: boolean; }

export interface Dice701State {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  remaining: number;
  lastPts: number;
  phase: "rolling" | "rolled" | "done";
}

export type Dice701Action = { type: "roll" } | { type: "next" };

function rollScore(dice: number[]): number {
  return dice[0]! + dice[1]! + dice[2]!;
}

export function initialState(seed: number, _settings: Dice701Settings): Dice701State {
  return { rngSeed: seed, round: 1, dice: null, remaining: START_SCORE, lastPts: 0, phase: "rolling" };
}

export function reducer(state: Dice701State, action: Dice701Action): Dice701State {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = rollScore(dice);
    let newRem = state.remaining - pts;
    if (newRem < 0) newRem = state.remaining; // bust
    const isLast = state.round >= TOTAL_ROUNDS || newRem === 0;
    return { ...state, rngSeed: nextSeed, dice, remaining: newRem, lastPts: pts, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: Dice701State): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: START_SCORE - state.remaining };
}
