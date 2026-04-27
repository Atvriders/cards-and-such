import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Double Down: 15 rounds. Roll 2 dice. Doubles +30; otherwise -5.
// Final score is clamped at 0 minimum on display, but internal calculation keeps actual score.

export const TOTAL_ROUNDS = 15;

export interface DoubleDownSettings { dummy: boolean; }

export interface DoubleDownState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null;
  score: number;
  phase: "ready" | "rolled" | "done";
  lastDelta: number;
  lastIsDouble: boolean;
}

export type DoubleDownAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DoubleDownSettings): DoubleDownState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "ready", lastDelta: 0, lastIsDouble: false };
}

export function reducer(state: DoubleDownState, action: DoubleDownAction): DoubleDownState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isDouble = a === b;
    const delta = isDouble ? 30 : -5;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b], score: state.score + delta, phase: isLast ? "done" : "rolled", lastDelta: delta, lastIsDouble: isDouble };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, phase: "ready", lastDelta: 0, lastIsDouble: false };
  }
  return state;
}

export function isTerminal(state: DoubleDownState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
