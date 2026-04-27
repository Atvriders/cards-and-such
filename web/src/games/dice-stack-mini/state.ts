import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Stack Mini: 10 rounds. Each round you roll one die. Track running stack:
// if the new value is >= the previous value (ascending), score 20 + value.
// If it breaks the ascending order, you score 0 and the stack resets.

export const TOTAL_ROUNDS = 10;

export interface DiceStackMiniSettings { dummy: boolean; }

export interface DiceStackMiniState {
  rngSeed: number;
  round: number;
  lastDie: number;
  newDie: number | null;
  score: number;
  lastPts: number;
  phase: "rolling" | "scored" | "done";
  stackSize: number;
}

export type DiceStackMiniAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceStackMiniSettings): DiceStackMiniState {
  return { rngSeed: seed, round: 1, lastDie: 0, newDie: null, score: 0, lastPts: 0, phase: "rolling", stackSize: 0 };
}

export function reducer(state: DiceStackMiniState, action: DiceStackMiniAction): DiceStackMiniState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const d = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const ascends = d >= state.lastDie;
    const pts = ascends ? 20 + d : 0;
    const newStack = ascends ? state.stackSize + 1 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return {
      ...state,
      rngSeed: nextSeed,
      newDie: d,
      lastDie: ascends ? d : 0, // reset stack on break
      score: state.score + pts,
      lastPts: pts,
      stackSize: newStack,
      phase: isLast ? "done" : "scored",
    };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, newDie: null, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceStackMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
