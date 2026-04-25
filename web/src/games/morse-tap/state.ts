import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type MorseSymbol = "dot" | "dash";
export type MorsePhase = "idle" | "showing" | "input" | "failed" | "complete";

export const MORSE_LETTERS: Record<string, readonly MorseSymbol[]> = {
  A: ["dot", "dash"],
  B: ["dash", "dot", "dot", "dot"],
  C: ["dash", "dot", "dash", "dot"],
  E: ["dot"],
  S: ["dot", "dot", "dot"],
  O: ["dash", "dash", "dash"],
  T: ["dash"],
  N: ["dash", "dot"],
};

const LETTER_KEYS = Object.keys(MORSE_LETTERS) as Array<keyof typeof MORSE_LETTERS>;

export interface MorseTapState {
  phase: MorsePhase;
  /** Current letter being practiced */
  letter: string;
  /** The morse sequence for current letter */
  target: readonly MorseSymbol[];
  /** Player's inputs so far this round */
  playerInput: readonly MorseSymbol[];
  /** Flash index during show phase */
  flashIndex: number;
  /** Whether we are mid-flash (showing a symbol) */
  activeSymbol: MorseSymbol | null;
  round: number;
  score: number;
  rngSeed: number;
  rngCounter: number;
}

export type MorseTapAction =
  | { type: "start" }
  | { type: "advance-flash" }
  | { type: "tap"; symbol: MorseSymbol }
  | { type: "submit" };

function pickLetter(seed: number, counter: number): string {
  const rng = mulberry32(seed + counter * 654321);
  return LETTER_KEYS[Math.floor(rng() * LETTER_KEYS.length)]!;
}

export function initialState(seed: number, _settings: Record<string, never>): MorseTapState {
  return {
    phase: "idle",
    letter: "",
    target: [],
    playerInput: [],
    flashIndex: -1,
    activeSymbol: null,
    round: 0,
    score: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: MorseTapState, action: MorseTapAction): MorseTapState {
  switch (action.type) {
    case "start": {
      if (state.phase === "idle" || state.phase === "failed" || state.phase === "complete") {
        const letter = pickLetter(state.rngSeed, state.rngCounter);
        const target = MORSE_LETTERS[letter]!;
        return {
          ...state,
          phase: "showing",
          letter,
          target,
          playerInput: [],
          flashIndex: 0,
          activeSymbol: null,
          round: state.round + 1,
          rngCounter: state.rngCounter + 1,
        };
      }
      return state;
    }
    case "advance-flash": {
      if (state.phase !== "showing") return state;
      if (state.activeSymbol !== null) {
        // End of this symbol flash — move to next
        const nextFlash = state.flashIndex + 1;
        if (nextFlash >= state.target.length) {
          return { ...state, phase: "input", flashIndex: -1, activeSymbol: null };
        }
        return { ...state, flashIndex: nextFlash, activeSymbol: null };
      } else {
        // Start this symbol flash
        return { ...state, activeSymbol: state.target[state.flashIndex]! };
      }
    }
    case "tap": {
      if (state.phase !== "input") return state;
      const newInput = [...state.playerInput, action.symbol];
      return { ...state, playerInput: newInput };
    }
    case "submit": {
      if (state.phase !== "input") return state;
      const correct = state.playerInput.length === state.target.length &&
        state.playerInput.every((s, i) => s === state.target[i]);
      if (correct) {
        return { ...state, phase: "complete", score: state.score + 1 };
      }
      return { ...state, phase: "failed" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: MorseTapState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: state.score };
  }
  return null;
}
