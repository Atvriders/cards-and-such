import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Straight Shot: 8 rounds. Each round roll 5 dice.
// Find longest run of consecutive integers (sorted unique values):
//   3-in-a-row +25; 4-in-a-row +50; 5-in-a-row +100.

export const TOTAL_ROUNDS = 8;

export interface StraightShotSettings { dummy: boolean; }

export interface StraightShotState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  phase: "ready" | "rolled" | "done";
  lastPts: number;
  lastLabel: string;
}

export type StraightShotAction = { type: "roll" } | { type: "next" };

export function longestStraight(dice: number[]): number {
  const uniq = Array.from(new Set(dice)).sort((a, b) => a - b);
  let best = 1, cur = 1;
  for (let i = 1; i < uniq.length; i++) {
    if (uniq[i]! - uniq[i-1]! === 1) { cur++; best = Math.max(best, cur); }
    else cur = 1;
  }
  return uniq.length === 0 ? 0 : best;
}

export function straightPoints(longest: number): { pts: number; label: string } {
  if (longest >= 5) return { pts: 100, label: "5-straight! +100" };
  if (longest === 4) return { pts: 50, label: "4-straight! +50" };
  if (longest === 3) return { pts: 25, label: "3-straight! +25" };
  return { pts: 0, label: "No straight" };
}

export function initialState(seed: number, _settings: StraightShotSettings): StraightShotState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, phase: "ready", lastPts: 0, lastLabel: "" };
}

export function reducer(state: StraightShotState, action: StraightShotAction): StraightShotState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = Array.from({ length: 5 }, () => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const len = longestStraight(dice);
    const { pts, label } = straightPoints(len);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, phase: isLast ? "done" : "rolled", lastPts: pts, lastLabel: label };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: [], phase: "ready", lastPts: 0, lastLabel: "" };
  }
  return state;
}

export function isTerminal(state: StraightShotState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
