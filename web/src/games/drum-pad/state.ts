import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DrumSound = "kick" | "snare" | "hihat" | "tom";
export type DrumPhase = "idle" | "showing" | "input" | "failed" | "complete";

export const DRUM_SOUNDS: DrumSound[] = ["kick", "snare", "hihat", "tom"];

export interface DrumPadState {
  phase: DrumPhase;
  pattern: readonly DrumSound[];
  playerInput: readonly DrumSound[];
  flashIndex: number;
  activeSound: DrumSound | null;
  round: number;
  rngSeed: number;
  rngCounter: number;
}

export type DrumPadAction =
  | { type: "start" }
  | { type: "advance-flash" }
  | { type: "hit"; sound: DrumSound };

function nextDrum(seed: number, counter: number): DrumSound {
  const rng = mulberry32(seed + counter * 543211);
  return DRUM_SOUNDS[Math.floor(rng() * DRUM_SOUNDS.length)]!;
}

export function initialState(seed: number, _settings: Record<string, never>): DrumPadState {
  return {
    phase: "idle",
    pattern: [],
    playerInput: [],
    flashIndex: -1,
    activeSound: null,
    round: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: DrumPadState, action: DrumPadAction): DrumPadState {
  switch (action.type) {
    case "start": {
      if (state.phase === "idle" || state.phase === "failed" || state.phase === "complete") {
        const newDrum = nextDrum(state.rngSeed, state.rngCounter);
        const newPattern = [...state.pattern, newDrum];
        return {
          ...state,
          phase: "showing",
          pattern: newPattern,
          playerInput: [],
          flashIndex: 0,
          activeSound: null,
          round: state.round + 1,
          rngCounter: state.rngCounter + 1,
        };
      }
      return state;
    }
    case "advance-flash": {
      if (state.phase !== "showing") return state;
      const nextFlash = state.flashIndex + 1;
      if (nextFlash >= state.pattern.length) {
        return { ...state, phase: "input", flashIndex: -1, activeSound: null };
      }
      return { ...state, flashIndex: nextFlash, activeSound: state.pattern[nextFlash]! };
    }
    case "hit": {
      if (state.phase !== "input") return state;
      const expected = state.pattern[state.playerInput.length];
      if (action.sound !== expected) {
        return { ...state, phase: "failed", activeSound: action.sound };
      }
      const newInput = [...state.playerInput, action.sound];
      if (newInput.length >= state.pattern.length) {
        return { ...state, phase: "complete", playerInput: newInput, activeSound: action.sound };
      }
      return { ...state, playerInput: newInput, activeSound: action.sound };
    }
    default:
      return state;
  }
}

export function isTerminal(state: DrumPadState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: Math.max(0, state.round - 1) };
  }
  return null;
}
