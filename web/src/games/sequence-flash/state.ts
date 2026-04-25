import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type FlashPhase = "idle" | "flashing" | "input" | "failed" | "complete";

export interface SequenceFlashState {
  phase: FlashPhase;
  gridSize: number;
  sequence: readonly number[];
  playerInput: readonly number[];
  flashStep: number;
  activeCell: number | null;
  round: number;
  rngSeed: number;
  rngCounter: number;
}

export type SequenceFlashAction =
  | { type: "start" }
  | { type: "advance-flash" }
  | { type: "tap-cell"; cell: number };

function nextCell(seed: number, counter: number, gridSize: number): number {
  const rng = mulberry32(seed + counter * 888017);
  return Math.floor(rng() * gridSize * gridSize);
}

export function initialState(seed: number, _settings: Record<string, never>): SequenceFlashState {
  return {
    phase: "idle",
    gridSize: 3,
    sequence: [],
    playerInput: [],
    flashStep: -1,
    activeCell: null,
    round: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: SequenceFlashState, action: SequenceFlashAction): SequenceFlashState {
  switch (action.type) {
    case "start": {
      if (state.phase === "idle" || state.phase === "failed" || state.phase === "complete") {
        const newCell = nextCell(state.rngSeed, state.rngCounter, state.gridSize);
        const newSequence = [...state.sequence, newCell];
        return {
          ...state,
          phase: "flashing",
          sequence: newSequence,
          playerInput: [],
          flashStep: 0,
          activeCell: newSequence[0]!,
          round: state.round + 1,
          rngCounter: state.rngCounter + 1,
        };
      }
      return state;
    }
    case "advance-flash": {
      if (state.phase !== "flashing") return state;
      const nextStep = state.flashStep + 1;
      if (nextStep >= state.sequence.length) {
        return { ...state, phase: "input", flashStep: -1, activeCell: null };
      }
      return { ...state, flashStep: nextStep, activeCell: state.sequence[nextStep]! };
    }
    case "tap-cell": {
      if (state.phase !== "input") return state;
      const expected = state.sequence[state.playerInput.length];
      if (action.cell !== expected) {
        return { ...state, phase: "failed", activeCell: action.cell };
      }
      const newInput = [...state.playerInput, action.cell];
      if (newInput.length >= state.sequence.length) {
        return { ...state, phase: "complete", playerInput: newInput, activeCell: action.cell };
      }
      return { ...state, playerInput: newInput, activeCell: action.cell };
    }
    default:
      return state;
  }
}

export function isTerminal(state: SequenceFlashState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: Math.max(0, state.round - 1) };
  }
  return null;
}
