import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DIE_COUNT = 3;

export interface DiceHalveItSettings { dummy: boolean; }

export interface DiceHalveItState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  score: number;
  lastPts: number;
  halved: boolean;
  phase: "rolling" | "rolled" | "done";
}

export type DiceHalveItAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceHalveItSettings): DiceHalveItState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, lastPts: 0, halved: false, phase: "rolling" };
}

export function reducer(state: DiceHalveItState, action: DiceHalveItAction): DiceHalveItState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = dice.reduce((a, b) => a + b, 0);
    let newScore = state.score;
    let pts = 0;
    let halved = false;
    if (sum >= 7) {
      pts = sum;
      newScore = state.score + sum;
    } else {
      halved = true;
      newScore = Math.floor(state.score / 2);
    }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: newScore, lastPts: pts, halved, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, halved: false, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceHalveItState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
