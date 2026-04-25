import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DicePyramidStackSettings { rounds: "5" | "10" | "15"; }
export interface DicePyramidStackState {
  settings: DicePyramidStackSettings;
  rng: () => number;
  dice: number[];       // current rolled dice (3)
  pyramid: number[][];  // rows of banked dice values
  score: number;
  round: number;
  totalRounds: number;
  phase: "rolling" | "gameover";
}
export type DicePyramidStackAction = { type: "roll" } | { type: "bank"; index: number };

function makeDicePyramidRng(seed: number) { return mulberry32(seed); }

export function initialState(seed: number, settings: DicePyramidStackSettings): DicePyramidStackState {
  const rng = makeDicePyramidRng(seed);
  const dice = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
  return { settings, rng, dice, pyramid: [], score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), phase: "rolling" };
}

export function reducer(state: DicePyramidStackState, action: DicePyramidStackAction): DicePyramidStackState {
  if (state.phase === "gameover") return state;
  switch (action.type) {
    case "roll": {
      const rng = state.rng;
      const dice = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
      const nextRound = state.round + 1;
      const phase = nextRound > state.totalRounds ? "gameover" : "rolling";
      return { ...state, dice, round: nextRound, phase };
    }
    case "bank": {
      const val = state.dice[action.index];
      if (val === undefined) return state;
      // add to pyramid — each row must sum <= row index * 6
      const pyramid = [...state.pyramid];
      const pts = val;
      // score: value * (pyramid length + 1) for row bonus
      const bonus = pyramid.length + 1;
      return { ...state, pyramid: [...pyramid, [val]], score: state.score + pts * bonus };
    }
    default: return state;
  }
}

export function isTerminal(state: DicePyramidStackState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
