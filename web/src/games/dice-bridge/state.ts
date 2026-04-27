import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Bridge: build a 6-segment bridge. Each turn you roll TWO dice. If their sum is
// between 7 and 12, you place a bridge segment (+30). Otherwise no segment is placed.
// You may BANK at any time and stop rolling. Final score: (segments * 30) + 50 if all 6.
// You have 12 rolls max.

export const SEGMENTS = 6;
export const MAX_ROLLS = 12;

export interface DiceBridgeSettings { dummy: boolean; }

export interface DiceBridgeState {
  rngSeed: number;
  segments: number;
  rollsUsed: number;
  dice: [number, number] | null;
  lastSegment: boolean;
  score: number;
  phase: "rolling" | "done";
}

export type DiceBridgeAction = { type: "roll" } | { type: "bank" };

export function initialState(seed: number, _s: DiceBridgeSettings): DiceBridgeState {
  return {
    rngSeed: seed,
    segments: 0,
    rollsUsed: 0,
    dice: null,
    lastSegment: false,
    score: 0,
    phase: "rolling",
  };
}

function score(segments: number): number {
  return segments * 30 + (segments >= SEGMENTS ? 50 : 0);
}

export function reducer(state: DiceBridgeState, action: DiceBridgeAction): DiceBridgeState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b;
    const ok = sum >= 7 && sum <= 12;
    const newSegments = state.segments + (ok ? 1 : 0);
    const rollsUsed = state.rollsUsed + 1;
    const built = newSegments >= SEGMENTS;
    if (built || rollsUsed >= MAX_ROLLS) {
      return { ...state, rngSeed: nextSeed, segments: newSegments, rollsUsed, dice: [a, b], lastSegment: ok, score: score(newSegments), phase: "done" };
    }
    return { ...state, rngSeed: nextSeed, segments: newSegments, rollsUsed, dice: [a, b], lastSegment: ok };
  }
  if (action.type === "bank") {
    return { ...state, score: score(state.segments), phase: "done" };
  }
  return state;
}

export function isTerminal(state: DiceBridgeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
