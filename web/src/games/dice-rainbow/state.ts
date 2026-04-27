import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 6;

export interface DiceRainbowSettings { dummy: boolean; }

export interface DiceRainbowState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  phase: "rolling" | "result" | "done";
  lastPts: number;
}

export type DiceRainbowAction = { type: "roll" } | { type: "next" };

export function uniqueFaces(dice: number[]): number {
  return new Set(dice).size;
}

export function initialState(seed: number, _settings: DiceRainbowSettings): DiceRainbowState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, phase: "rolling", lastPts: 0 };
}

export function reducer(state: DiceRainbowState, action: DiceRainbowAction): DiceRainbowState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < 6; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const u = uniqueFaces(dice);
    let pts = 0;
    if (u === 6) pts = 75;
    else if (u === 5) pts = 25;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], phase: "rolling", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceRainbowState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
