import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Triple Toss: 12 rounds. Roll 3 dice.
// All-3-same +100; two-same +20; all-different 0.

export const TOTAL_ROUNDS = 12;

export interface TripleTossSettings { dummy: boolean; }

export interface TripleTossState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  phase: "ready" | "rolled" | "done";
  lastPts: number;
  lastLabel: string;
}

export type TripleTossAction = { type: "roll" } | { type: "next" };

export function scoreThree(dice: number[]): { pts: number; label: string } {
  if (dice[0] === dice[1] && dice[1] === dice[2]) return { pts: 100, label: "Triple! +100" };
  if (dice[0] === dice[1] || dice[1] === dice[2] || dice[0] === dice[2]) return { pts: 20, label: "Pair! +20" };
  return { pts: 0, label: "All different — 0" };
}

export function initialState(seed: number, _settings: TripleTossSettings): TripleTossState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, phase: "ready", lastPts: 0, lastLabel: "" };
}

export function reducer(state: TripleTossState, action: TripleTossAction): TripleTossState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = Array.from({ length: 3 }, () => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { pts, label } = scoreThree(dice);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, phase: isLast ? "done" : "rolled", lastPts: pts, lastLabel: label };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: [], phase: "ready", lastPts: 0, lastLabel: "" };
  }
  return state;
}

export function isTerminal(state: TripleTossState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
