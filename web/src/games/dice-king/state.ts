import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice King: 12 rounds. Roll 3 dice each round. Score = sum.
// Bonus: +20 if all three same, +5 for two of a kind. Track highest single sum.
export const TOTAL_ROUNDS = 12;

export interface DiceKingSettings { dummy: boolean; }
export interface DiceKingState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  highestSum: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
}
export type DiceKingAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceKingSettings): DiceKingState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, highestSum: 0, phase: "rolling", lastPts: 0 };
}

export function scoreRound(dice: number[]): number {
  const sum = dice.reduce((a, b) => a + b, 0);
  const allSame = dice[0] === dice[1] && dice[1] === dice[2];
  if (allSame) return sum + 20;
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d] = (counts[d] || 0) + 1;
  if (Object.values(counts).some(n => n === 2)) return sum + 5;
  return sum;
}

export function reducer(state: DiceKingState, action: DiceKingAction): DiceKingState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = [0,1,2].map(() => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreRound(dice);
    const sum = dice.reduce((a, b) => a + b, 0);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, highestSum: Math.max(state.highestSum, sum), phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [], phase: "rolling", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceKingState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
