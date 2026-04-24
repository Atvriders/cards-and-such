import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Phase = "show" | "input" | "feedback" | "done";

function generateDigits(seed: number, counter: number, length: number): number[] {
  const rng = mulberry32(seed + counter * 999983);
  return Array.from({ length }, () => Math.floor(rng() * 10));
}

export interface DigitSpanState {
  settings: { mode: "forward" | "backward"; startLength: "3" | "4" | "5" };
  phase: Phase;
  sequence: number[];
  showIndex: number; // which digit is currently shown
  input: string; // user's entered digits
  spanLength: number; // current span length
  correct: number; // rounds correct
  lives: number;
  round: number;
  lastCorrect: boolean | null;
  ended: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type DigitSpanAction =
  | { type: "tick" } // advance showIndex
  | { type: "type"; digit: string }
  | { type: "submit" }
  | { type: "next" };

const MAX_LIVES = 3;

export function initialState(
  seed: number,
  settings: { mode: "forward" | "backward"; startLength: "3" | "4" | "5" },
): DigitSpanState {
  const spanLength = parseInt(settings.startLength, 10);
  return {
    settings,
    phase: "show",
    sequence: generateDigits(seed, 0, spanLength),
    showIndex: 0,
    input: "",
    spanLength,
    correct: 0,
    lives: MAX_LIVES,
    round: 1,
    lastCorrect: null,
    ended: false,
    rngSeed: seed,
    rngCounter: 1,
  };
}

export function reducer(state: DigitSpanState, action: DigitSpanAction): DigitSpanState {
  if (state.ended) return state;

  switch (action.type) {
    case "tick": {
      if (state.phase !== "show") return state;
      const nextIndex = state.showIndex + 1;
      if (nextIndex >= state.sequence.length) {
        return { ...state, phase: "input", showIndex: nextIndex };
      }
      return { ...state, showIndex: nextIndex };
    }
    case "type": {
      if (state.phase !== "input") return state;
      const newInput = (state.input + action.digit).slice(0, state.spanLength);
      return { ...state, input: newInput };
    }
    case "submit": {
      if (state.phase !== "input" || state.input.length < state.spanLength) return state;
      const expected =
        state.settings.mode === "backward"
          ? [...state.sequence].reverse().map(String).join("")
          : state.sequence.map(String).join("");
      const isCorrect = state.input === expected;
      const newLives = isCorrect ? state.lives : state.lives - 1;
      const ended = newLives <= 0;
      return {
        ...state,
        phase: ended ? "done" : "feedback",
        lives: newLives,
        correct: state.correct + (isCorrect ? 1 : 0),
        lastCorrect: isCorrect,
        ended,
      };
    }
    case "next": {
      if (state.phase !== "feedback") return state;
      const newSpanLength = state.lastCorrect
        ? state.spanLength + 1
        : state.spanLength;
      const seq = generateDigits(state.rngSeed, state.rngCounter, newSpanLength);
      return {
        ...state,
        phase: "show",
        sequence: seq,
        showIndex: 0,
        input: "",
        spanLength: newSpanLength,
        round: state.round + 1,
        lastCorrect: null,
        rngCounter: state.rngCounter + 1,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: DigitSpanState): { score: number } | null {
  if (!state.ended && state.phase !== "done") return null;
  if (!state.ended) return null;
  return { score: state.correct * 10 + state.spanLength };
}
