import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Blackjack: 8 rounds. Each round, player chooses to "roll" (one die) or "stand". Sum to 21 without busting.
// Score = total at stand, 0 if busted (>21). Bonus +10 if exactly 21.

export const TOTAL_ROUNDS = 8;
export const TARGET = 21;

export interface DiceBlackjackSettings { dummy: boolean; }

export interface DiceBlackjackState {
  rngSeed: number;
  round: number;
  total: number; // current round
  rolls: number[]; // current round's rolls
  score: number;
  phase: "playing" | "scored" | "done";
  busted: boolean;
  lastPts: number;
}

export type DiceBlackjackAction = { type: "roll" } | { type: "stand" } | { type: "next" };

export function initialState(seed: number, _settings: DiceBlackjackSettings): DiceBlackjackState {
  return { rngSeed: seed, round: 1, total: 0, rolls: [], score: 0, phase: "playing", busted: false, lastPts: 0 };
}

function nextRound(state: DiceBlackjackState, lastPts: number, busted: boolean): DiceBlackjackState {
  const isLast = state.round >= TOTAL_ROUNDS;
  return { ...state, score: state.score + lastPts, phase: isLast ? "done" : "scored", busted, lastPts };
}

export function reducer(state: DiceBlackjackState, action: DiceBlackjackAction): DiceBlackjackState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "playing") return state;
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const total = state.total + die;
    const rolls = [...state.rolls, die];
    if (total > TARGET) {
      return nextRound({ ...state, rngSeed: nextSeed, total, rolls }, 0, true);
    }
    if (total === TARGET) {
      return nextRound({ ...state, rngSeed: nextSeed, total, rolls }, total + 10, false);
    }
    return { ...state, rngSeed: nextSeed, total, rolls };
  }
  if (action.type === "stand") {
    if (state.phase !== "playing") return state;
    return nextRound(state, state.total, false);
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, total: 0, rolls: [], phase: "playing", busted: false, lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceBlackjackState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
