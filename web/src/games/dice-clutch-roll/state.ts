import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Roll 4 dice; keep best 3. Score is sum of top 3.
export interface DiceClutchRollSettings { rounds: "10" | "20"; }
export interface DiceClutchRollState {
  rngSeed: number; allDice: number[]; keptDice: number[]; score: number;
  round: number; maxRounds: number; phase: "waiting" | "result" | "gameover"; lastPts: number;
}
export type DiceClutchRollAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, settings: DiceClutchRollSettings): DiceClutchRollState {
  const rng = mulberry32(seed);
  return { rngSeed: Math.floor(rng() * 2 ** 31), allDice: [], keptDice: [], score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "waiting", lastPts: 0 };
}

export function reducer(state: DiceClutchRollState, action: DiceClutchRollAction): DiceClutchRollState {
  if (state.phase === "gameover") return state;
  if (action.type === "roll" && state.phase === "waiting") {
    const rng = mulberry32(state.rngSeed);
    const all = [1,2,3,4].map(() => Math.floor(rng() * 6) + 1);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sorted = [...all].sort((a, b) => b - a);
    const kept = sorted.slice(0, 3);
    const pts = kept.reduce((s, v) => s + v, 0);
    const done = state.round >= state.maxRounds;
    return { ...state, allDice: all, keptDice: kept, lastPts: pts, score: state.score + pts, rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, allDice: [], keptDice: [], round: state.round + 1, phase: "waiting" };
  }
  return state;
}

export function isTerminal(state: DiceClutchRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
