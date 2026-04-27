import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Clutch: 8 rounds. Roll 2 dice each round. Each round's sum is the points.
// Final round (round 8): score is sum * 5 (clutch multiplier).
export const TOTAL_ROUNDS = 8;

export interface DiceClutchSettings { dummy: boolean; }
export interface DiceClutchState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null;
  score: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
}
export type DiceClutchAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceClutchSettings): DiceClutchState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "rolling", lastPts: 0 };
}

export function reducer(state: DiceClutchState, action: DiceClutchAction): DiceClutchState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b;
    const isLast = state.round >= TOTAL_ROUNDS;
    const pts = isLast ? sum * 5 : sum;
    return { ...state, rngSeed: nextSeed, dice: [a, b], score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: null, phase: "rolling", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceClutchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
