import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type SimonColor = "red" | "green" | "blue" | "yellow";
export type SimonPhase = "idle" | "showing" | "input" | "failed" | "complete";

export const SIMON_COLORS: SimonColor[] = ["red", "green", "blue", "yellow"];

export interface SimonState {
  phase: SimonPhase;
  /** The full sequence so far */
  sequence: readonly SimonColor[];
  /** Index into sequence for current player input */
  playerIndex: number;
  /** Which color is currently flashing during show phase (-1 = none) */
  flashIndex: number;
  /** Currently highlighted color (null = none) */
  activeColor: SimonColor | null;
  /** Round number (starts at 1, grows each success) */
  round: number;
  rngSeed: number;
  rngCounter: number;
}

export type SimonAction =
  | { type: "start" }
  | { type: "advance-flash" }
  | { type: "click"; color: SimonColor };

function nextColor(seed: number, counter: number): SimonColor {
  const rng = mulberry32(seed + counter * 999983);
  return SIMON_COLORS[Math.floor(rng() * 4)]!;
}

export function initialState(seed: number, _settings: Record<string, never>): SimonState {
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

export function reducer(state: SimonState, action: SimonAction): SimonState {
  switch (action.type) {
    case "start": {
      if (state.phase === "failed" || state.phase === "idle" || state.phase === "complete") {
        // Start fresh or continue to next round
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
      // Clear current flash
      const nextFlash = state.flashIndex + 1;
      if (nextFlash >= state.sequence.length) {
        // Done showing — move to input
        return {
          ...state,
          phase: "input",
          flashIndex: -1,
          activeColor: null,
          playerIndex: 0,
        };
      }
      // Show next color
      return {
        ...state,
        flashIndex: nextFlash,
        activeColor: state.sequence[nextFlash]!,
      };
    }

    case "click": {
      if (state.phase !== "input") return state;

      const expected = state.sequence[state.playerIndex];
      if (action.color !== expected) {
        // Wrong — game over
        return { ...state, phase: "failed", activeColor: action.color };
      }

      const newPlayerIndex = state.playerIndex + 1;
      if (newPlayerIndex >= state.sequence.length) {
        // Completed this round
        return {
          ...state,
          phase: "complete",
          playerIndex: newPlayerIndex,
          activeColor: action.color,
        };
      }

      return {
        ...state,
        playerIndex: newPlayerIndex,
        activeColor: action.color,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SimonState): { score: number } | null {
  if (state.phase === "failed") {
    // Score = number of rounds successfully completed before failure
    const score = Math.max(0, state.round - 1);
    return { score };
  }
  return null;
}
