import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type RungColor = "red" | "blue" | "green" | "yellow" | "purple";
export type LadderPhase = "idle" | "descending" | "input" | "failed" | "complete";

export const RUNG_COLORS: RungColor[] = ["red", "blue", "green", "yellow", "purple"];

export interface RhythmLadderState {
  phase: LadderPhase;
  /** The full color sequence (top to bottom of ladder) */
  rungs: readonly RungColor[];
  /** Which rung index is currently highlighted (0 = top, -1 = none) */
  activeRung: number;
  /** Player's input so far */
  playerInput: readonly RungColor[];
  round: number;
  rngSeed: number;
  rngCounter: number;
}

export type RhythmLadderAction =
  | { type: "start" }
  | { type: "advance-rung" }
  | { type: "step"; color: RungColor };

function nextColor(seed: number, counter: number): RungColor {
  const rng = mulberry32(seed + counter * 398713);
  return RUNG_COLORS[Math.floor(rng() * RUNG_COLORS.length)]!;
}

export function initialState(seed: number, _settings: Record<string, never>): RhythmLadderState {
  return {
    phase: "idle",
    rungs: [],
    activeRung: -1,
    playerInput: [],
    round: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: RhythmLadderState, action: RhythmLadderAction): RhythmLadderState {
  switch (action.type) {
    case "start": {
      if (state.phase === "idle" || state.phase === "failed" || state.phase === "complete") {
        const newColor = nextColor(state.rngSeed, state.rngCounter);
        const newRungs = [...state.rungs, newColor];
        return {
          ...state,
          phase: "descending",
          rungs: newRungs,
          activeRung: 0,
          playerInput: [],
          round: state.round + 1,
          rngCounter: state.rngCounter + 1,
        };
      }
      return state;
    }
    case "advance-rung": {
      if (state.phase !== "descending") return state;
      const nextRung = state.activeRung + 1;
      if (nextRung >= state.rungs.length) {
        return { ...state, phase: "input", activeRung: -1 };
      }
      return { ...state, activeRung: nextRung };
    }
    case "step": {
      if (state.phase !== "input") return state;
      const expected = state.rungs[state.playerInput.length];
      if (action.color !== expected) {
        return { ...state, phase: "failed", activeRung: -1 };
      }
      const newInput = [...state.playerInput, action.color];
      if (newInput.length >= state.rungs.length) {
        return { ...state, phase: "complete", playerInput: newInput, activeRung: -1 };
      }
      return { ...state, playerInput: newInput };
    }
    default:
      return state;
  }
}

export function isTerminal(state: RhythmLadderState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: Math.max(0, state.round - 1) };
  }
  return null;
}
