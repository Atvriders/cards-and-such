import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Note = "C" | "D" | "E" | "F" | "G" | "A";
export type MelodyPhase = "idle" | "playing" | "input" | "failed" | "complete";

export const NOTES: Note[] = ["C", "D", "E", "F", "G", "A"];

export interface MelodyRepeaterState {
  phase: MelodyPhase;
  melody: readonly Note[];
  playerIndex: number;
  flashIndex: number;
  activeNote: Note | null;
  round: number;
  rngSeed: number;
  rngCounter: number;
}

export type MelodyRepeaterAction =
  | { type: "start" }
  | { type: "advance-note" }
  | { type: "play"; note: Note };

function nextNote(seed: number, counter: number): Note {
  const rng = mulberry32(seed + counter * 777563);
  return NOTES[Math.floor(rng() * NOTES.length)]!;
}

export function initialState(seed: number, _settings: Record<string, never>): MelodyRepeaterState {
  return {
    phase: "idle",
    melody: [],
    playerIndex: 0,
    flashIndex: -1,
    activeNote: null,
    round: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: MelodyRepeaterState, action: MelodyRepeaterAction): MelodyRepeaterState {
  switch (action.type) {
    case "start": {
      if (state.phase === "idle" || state.phase === "failed" || state.phase === "complete") {
        const newNote = nextNote(state.rngSeed, state.rngCounter);
        const newMelody = [...state.melody, newNote];
        return {
          ...state,
          phase: "playing",
          melody: newMelody,
          playerIndex: 0,
          flashIndex: 0,
          activeNote: null,
          round: state.round + 1,
          rngCounter: state.rngCounter + 1,
        };
      }
      return state;
    }
    case "advance-note": {
      if (state.phase !== "playing") return state;
      const nextFlash = state.flashIndex + 1;
      if (nextFlash >= state.melody.length) {
        return { ...state, phase: "input", flashIndex: -1, activeNote: null, playerIndex: 0 };
      }
      return { ...state, flashIndex: nextFlash, activeNote: state.melody[nextFlash]! };
    }
    case "play": {
      if (state.phase !== "input") return state;
      const expected = state.melody[state.playerIndex];
      if (action.note !== expected) {
        return { ...state, phase: "failed", activeNote: action.note };
      }
      const newIndex = state.playerIndex + 1;
      if (newIndex >= state.melody.length) {
        return { ...state, phase: "complete", playerIndex: newIndex, activeNote: action.note };
      }
      return { ...state, playerIndex: newIndex, activeNote: action.note };
    }
    default:
      return state;
  }
}

export function isTerminal(state: MelodyRepeaterState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: Math.max(0, state.round - 1) };
  }
  return null;
}
