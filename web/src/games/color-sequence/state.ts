import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type CSColor = "red" | "green" | "blue" | "yellow" | "purple";
export type CSPhase = "idle" | "showing" | "input" | "failed" | "complete";

export const CS_COLORS: CSColor[] = ["red", "green", "blue", "yellow", "purple"];

export interface ColorSequenceState {
  phase: CSPhase;
  sequence: readonly CSColor[];
  playerIndex: number;
  flashIndex: number;
  activeColor: CSColor | null;
  round: number;
  rngSeed: number;
  rngCounter: number;
}

export type ColorSequenceAction =
  | { type: "start" }
  | { type: "advance-flash" }
  | { type: "click"; color: CSColor };

function nextColor(seed: number, counter: number): CSColor {
  const rng = mulberry32(seed + counter * 999983);
  return CS_COLORS[Math.floor(rng() * 5)]!;
}

export function initialState(seed: number, _settings: Record<string, never> = {}): ColorSequenceState {
  return {
    phase: "idle",
    sequence: [],
    playerIndex: 0,
    flashIndex: -1,
    activeColor: null,
    round: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: ColorSequenceState, action: ColorSequenceAction): ColorSequenceState {
  switch (action.type) {
    case "start": {
      if (state.phase === "failed" || state.phase === "idle" || state.phase === "complete") {
        const newColor = nextColor(state.rngSeed, state.rngCounter);
        const newSequence = [...state.sequence, newColor];
        return {
          ...state,
          phase: "showing",
          sequence: newSequence,
          playerIndex: 0,
          flashIndex: 0,
          activeColor: null,
          round: state.round + 1,
          rngCounter: state.rngCounter + 1,
        };
      }
      return state;
    }

    case "advance-flash": {
      if (state.phase !== "showing") return state;
      const nextFlash = state.flashIndex + 1;
      if (nextFlash >= state.sequence.length) {
        return { ...state, phase: "input", flashIndex: -1, activeColor: null, playerIndex: 0 };
      }
      return { ...state, flashIndex: nextFlash, activeColor: state.sequence[nextFlash]! };
    }

    case "click": {
      if (state.phase !== "input") return state;
      const expected = state.sequence[state.playerIndex];
      if (action.color !== expected) {
        return { ...state, phase: "failed", activeColor: action.color };
      }
      const newPlayerIndex = state.playerIndex + 1;
      if (newPlayerIndex >= state.sequence.length) {
        return { ...state, phase: "complete", playerIndex: newPlayerIndex, activeColor: action.color };
      }
      return { ...state, playerIndex: newPlayerIndex, activeColor: action.color };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ColorSequenceState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: Math.max(0, state.round - 1) };
  }
  return null;
}
