import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Double or Nothing: start with 10 points. Each turn: roll 2d6.
// If both dice match (doubles) — double your score. Otherwise lose 3 points.
// Decide to bank (keep score) or roll again. If score <= 0: bust.

export interface DoubleOrNothingSettings {
  startScore: "10" | "20" | "50";
}

export interface DoubleOrNothingState {
  dice: [number, number];
  score: number;
  banked: number;
  round: number;
  phase: "rolling" | "result" | "banked" | "bust";
  lastDoubles: boolean;
  rngSeed: number;
}

export type DoubleOrNothingAction =
  | { type: "roll" }
  | { type: "bank" };

export function initialState(seed: number, settings: DoubleOrNothingSettings): DoubleOrNothingState {
  return {
    dice: [1, 1], score: parseInt(settings.startScore, 10),
    banked: 0, round: 0,
    phase: "rolling", lastDoubles: false, rngSeed: seed,
  };
}

export function reducer(state: DoubleOrNothingState, action: DoubleOrNothingAction): DoubleOrNothingState {
  if (state.phase === "banked" || state.phase === "bust") return state;
  if (action.type === "bank") {
    if (state.round === 0) return state; // must roll at least once
    return { ...state, banked: state.score, phase: "banked" };
  }
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed + state.round * 73);
    const d1 = Math.floor(rng() * 6) + 1;
    const d2 = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const doubles = d1 === d2;
    let newScore = doubles ? state.score * 2 : state.score - 3;
    if (newScore < 0) newScore = 0;
    const phase = newScore <= 0 ? "bust" : "result";
    return { ...state, dice: [d1, d2], score: newScore, round: state.round + 1, lastDoubles: doubles, phase, rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: DoubleOrNothingState): { score: number } | null {
  if (state.phase === "banked") return { score: state.banked };
  if (state.phase === "bust") return { score: 0 };
  return null;
}
