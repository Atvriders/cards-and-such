import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Leap: roll dice repeatedly to move from 0 to 50. Each roll advances by the rolled
// value, BUT a roll of 1 sends you back 5 spaces (to a min of 0). Game ends when you reach
// 50 or use 25 rolls. Score = max(0, 200 - rollsUsed * 5) plus bonus 100 if reached 50.

export const TARGET = 50;
export const MAX_ROLLS = 25;

export interface DiceLeapSettings { dummy: boolean; }

export interface DiceLeapState {
  rngSeed: number;
  position: number;
  rollsUsed: number;
  lastRoll: number | null;
  score: number;
  reached: boolean;
  phase: "rolling" | "done";
}

export type DiceLeapAction = { type: "roll" };

export function initialState(seed: number, _s: DiceLeapSettings): DiceLeapState {
  return {
    rngSeed: seed,
    position: 0,
    rollsUsed: 0,
    lastRoll: null,
    score: 0,
    reached: false,
    phase: "rolling",
  };
}

export function reducer(state: DiceLeapState, action: DiceLeapAction): DiceLeapState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pos = state.position;
    if (r === 1) pos = Math.max(0, pos - 5);
    else pos = pos + r;
    const rollsUsed = state.rollsUsed + 1;
    const reached = pos >= TARGET;
    if (reached || rollsUsed >= MAX_ROLLS) {
      const score = Math.max(0, 200 - rollsUsed * 5) + (reached ? 100 : 0);
      return { ...state, rngSeed: nextSeed, position: Math.min(pos, TARGET), rollsUsed, lastRoll: r, reached, score, phase: "done" };
    }
    return { ...state, rngSeed: nextSeed, position: pos, rollsUsed, lastRoll: r };
  }
  return state;
}

export function isTerminal(state: DiceLeapState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
