import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const NUM_DICE = 3;

export interface DiceBlacksmithSettings { dummy: boolean; }

export interface DiceBlacksmithState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "scored" | "done";
}

export type DiceBlacksmithAction = { type: "roll" } | { type: "next" };

export function scoreDice(dice: number[]): number {
  const counts: Record<number, number> = {}; for (const d of dice) counts[d] = (counts[d]||0)+1; let pts = 0; for (const k of Object.keys(counts)) { const c = counts[Number(k)]!; if (c >= 3) pts += 30; else if (c >= 2) pts += 15; } return pts;
}

export function initialState(seed: number, _settings: DiceBlacksmithSettings): DiceBlacksmithState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll" };
}

export function reducer(state: DiceBlacksmithState, action: DiceBlacksmithAction): DiceBlacksmithState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < NUM_DICE; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreDice(dice);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll" };
  }
  return state;
}

export function isTerminal(state: DiceBlacksmithState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
