import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Vortex: 10 rounds. Each round, pick a multiplier (x1, x2, x3, x4). Then roll 1 die.
// If the rolled value >= multiplier, score = roll * multiplier. Otherwise score = 0 (vortex bust).

export const TOTAL_ROUNDS = 10;

export interface DiceVortexSettings { dummy: boolean; }

export interface DiceVortexState {
  rngSeed: number;
  round: number;
  multiplier: number | null;
  die: number | null;
  bust: boolean;
  pts: number;
  score: number;
  phase: "choosing" | "scored" | "done";
}

export type DiceVortexAction = { type: "pick"; multiplier: number } | { type: "next" };

export function initialState(seed: number, _settings: DiceVortexSettings): DiceVortexState {
  return { rngSeed: seed, round: 1, multiplier: null, die: null, bust: false, pts: 0, score: 0, phase: "choosing" };
}

export function reducer(state: DiceVortexState, action: DiceVortexAction): DiceVortexState {
  if (state.phase === "done") return state;
  if (action.type === "pick") {
    if (state.phase !== "choosing") return state;
    const m = action.multiplier;
    if (m < 1 || m > 4) return state;
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const bust = die < m;
    const pts = bust ? 0 : die * m;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, multiplier: m, die, bust, pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, multiplier: null, die: null, bust: false, pts: 0, phase: "choosing" };
  }
  return state;
}

export function isTerminal(state: DiceVortexState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
