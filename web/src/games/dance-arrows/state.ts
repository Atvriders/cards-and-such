import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Arrow = "up" | "down" | "left" | "right";
export type DancePhase = "idle" | "showing" | "input" | "failed" | "complete";

export const ARROWS: Arrow[] = ["up", "down", "left", "right"];

export interface DanceArrowsState {
  phase: DancePhase;
  sequence: readonly Arrow[];
  playerIndex: number;
  flashIndex: number;
  activeArrow: Arrow | null;
  round: number;
  rngSeed: number;
  rngCounter: number;
}

export type DanceArrowsAction =
  | { type: "start" }
  | { type: "advance-flash" }
  | { type: "press"; arrow: Arrow };

function nextArrow(seed: number, counter: number): Arrow {
  const rng = mulberry32(seed + counter * 999983);
  return ARROWS[Math.floor(rng() * 4)]!;
}

export function initialState(seed: number, _settings: Record<string, never>): DanceArrowsState {
  return {
    phase: "idle",
    sequence: [],
    playerIndex: 0,
    flashIndex: -1,
    activeArrow: null,
    round: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: DanceArrowsState, action: DanceArrowsAction): DanceArrowsState {
  switch (action.type) {
    case "start": {
      if (state.phase === "idle" || state.phase === "failed" || state.phase === "complete") {
        const newArrow = nextArrow(state.rngSeed, state.rngCounter);
        const newSequence = [...state.sequence, newArrow];
        return {
          ...state,
          phase: "showing",
          sequence: newSequence,
          playerIndex: 0,
          flashIndex: 0,
          activeArrow: null,
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
        return { ...state, phase: "input", flashIndex: -1, activeArrow: null, playerIndex: 0 };
      }
      return { ...state, flashIndex: nextFlash, activeArrow: state.sequence[nextFlash]! };
    }
    case "press": {
      if (state.phase !== "input") return state;
      const expected = state.sequence[state.playerIndex];
      if (action.arrow !== expected) {
        return { ...state, phase: "failed", activeArrow: action.arrow };
      }
      const newIndex = state.playerIndex + 1;
      if (newIndex >= state.sequence.length) {
        return { ...state, phase: "complete", playerIndex: newIndex, activeArrow: action.arrow };
      }
      return { ...state, playerIndex: newIndex, activeArrow: action.arrow };
    }
    default:
      return state;
  }
}

export function isTerminal(state: DanceArrowsState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: Math.max(0, state.round - 1) };
  }
  return null;
}
