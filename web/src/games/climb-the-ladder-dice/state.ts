import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Climb the Ladder: 6 rungs (targets 2-7). Each rung = roll 1d6+1d6.
// Must meet or beat the target sum to score. Miss = 0 for that rung.
// Rung 1 target: 4, Rung 2: 5, ..., Rung 6: 9. Score = sum of passed rungs.

export interface ClimbTheLadderSettings {
  rerolls: "0" | "1" | "2";
}

const RUNGS = [4, 5, 6, 7, 8, 9] as const;

export interface ClimbTheLadderState {
  rung: number;          // 0-5
  dice: [number, number];
  rerollsLeft: number;
  maxRerolls: number;
  held: [boolean, boolean];
  rolledOnce: boolean;
  score: number;
  rungScores: (number | null)[];
  phase: "rolling" | "gameover";
  rngSeed: number;
}

export type ClimbTheLadderAction =
  | { type: "roll" }
  | { type: "toggleHold"; idx: 0 | 1 }
  | { type: "accept" };

export function initialState(seed: number, settings: ClimbTheLadderSettings): ClimbTheLadderState {
  const maxRerolls = parseInt(settings.rerolls, 10);
  const rng = mulberry32(seed);
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  return {
    rung: 0, dice: [d1, d2], rerollsLeft: maxRerolls, maxRerolls,
    held: [false, false], rolledOnce: true,
    score: 0, rungScores: Array(6).fill(null),
    phase: "rolling", rngSeed: Math.floor(rng() * 2 ** 31),
  };
}

export function reducer(state: ClimbTheLadderState, action: ClimbTheLadderAction): ClimbTheLadderState {
  if (state.phase === "gameover") return state;
  if (action.type === "toggleHold") {
    if (state.rerollsLeft === 0) return state;
    const held: [boolean, boolean] = [...state.held] as [boolean, boolean];
    held[action.idx] = !held[action.idx];
    return { ...state, held };
  }
  if (action.type === "roll") {
    if (state.rerollsLeft === 0) return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = state.held[0] ? state.dice[0] : Math.floor(rng() * 6) + 1;
    const d2 = state.held[1] ? state.dice[1] : Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, dice: [d1, d2], rerollsLeft: state.rerollsLeft - 1, rolledOnce: true, held: [false, false], rngSeed: nextSeed };
  }
  if (action.type === "accept") {
    if (!state.rolledOnce) return state;
    const target = RUNGS[state.rung]!;
    const sum = state.dice[0] + state.dice[1];
    const passed = sum >= target;
    const pts = passed ? sum : 0;
    const rungScores = [...state.rungScores];
    rungScores[state.rung] = pts;
    const nextRung = state.rung + 1;
    const newScore = state.score + pts;
    if (nextRung >= 6) {
      return { ...state, score: newScore, rungScores, phase: "gameover" };
    }
    const rng = mulberry32(state.rngSeed);
    const nd1 = Math.floor(rng() * 6) + 1;
    const nd2 = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rung: nextRung, dice: [nd1, nd2], rerollsLeft: state.maxRerolls, held: [false, false], rolledOnce: true, score: newScore, rungScores, rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: ClimbTheLadderState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}

export { RUNGS };
