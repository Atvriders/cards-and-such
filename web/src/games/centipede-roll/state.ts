import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Centipede Roll: 25 rolls of 1 die, scored at end based on closeness to 100.
// Avg per die = 3.5, so 25 rolls average 87.5. Player can stop early — but then loses
// the unrolled-from-target points. Simpler: just roll all 25 (no skill) and score by
// 100 - |sum-100|, floor 0.
// To add a small choice: player can choose to STOP after each roll.
// Score = max(0, 100 - |sum - 100| - rollsLeft*1) so stopping early near 100 helps.

export const TOTAL_ROLLS = 25;

export interface CentipedeRollSettings { dummy: boolean; }

export interface CentipedeRollState {
  rngSeed: number;
  rolls: number[];
  sum: number;
  phase: "rolling" | "done";
}

export type CentipedeRollAction = { type: "roll" } | { type: "stop" };

export function targetScore(sum: number): number {
  return Math.max(0, 100 - Math.abs(sum - 100));
}

export function initialState(seed: number, _settings: CentipedeRollSettings): CentipedeRollState {
  return { rngSeed: seed, rolls: [], sum: 0, phase: "rolling" };
}

export function reducer(state: CentipedeRollState, action: CentipedeRollAction): CentipedeRollState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.rolls.length >= TOTAL_ROLLS) return state;
    const rng = mulberry32(state.rngSeed);
    const v = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rolls = [...state.rolls, v];
    const sum = state.sum + v;
    const isLast = rolls.length >= TOTAL_ROLLS;
    return { ...state, rngSeed: nextSeed, rolls, sum, phase: isLast ? "done" : "rolling" };
  }
  if (action.type === "stop") {
    return { ...state, phase: "done" };
  }
  return state;
}

export function isTerminal(state: CentipedeRollState): { score: number } | null {
  return state.phase === "done" ? { score: targetScore(state.sum) } : null;
}
