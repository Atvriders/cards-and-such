import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { pickTarget, isAcceptedGuess } from "./words.js";

export type LetterState = "green" | "yellow" | "gray";

export interface WordGuessAttempt {
  guess: string;
  marks: readonly LetterState[];
}

export interface WordGuessState {
  settings: { wordLength: "4" | "5" | "6"; maxAttempts: "5" | "6" | "7" };
  target: string;
  wordLength: number;
  maxAttempts: number;
  current: string;
  attempts: readonly WordGuessAttempt[];
  won: boolean;
  lost: boolean;
  error: string | null;
}

export type WordGuessAction =
  | { type: "letter"; char: string }
  | { type: "backspace" }
  | { type: "submit" };

export interface WordGuessSettings {
  wordLength: "4" | "5" | "6";
  maxAttempts: "5" | "6" | "7";
}

/**
 * Compute green/yellow/gray marks for a guess against a target.
 * Implements the multiplicity rule:
 *   1. First pass: mark exact (position+letter) matches as green; consume those target letters.
 *   2. Second pass: for each remaining guess letter, if an unconsumed copy exists in target → yellow;
 *      otherwise gray. Consume each yellow match too.
 */
export function computeMarks(guess: string, target: string): LetterState[] {
  const len = target.length;
  const marks: LetterState[] = new Array(len).fill("gray");
  const targetConsumed: boolean[] = new Array(len).fill(false);
  const guessConsumed: boolean[] = new Array(len).fill(false);

  // Pass 1: green
  for (let i = 0; i < len; i++) {
    if (guess[i] === target[i]) {
      marks[i] = "green";
      targetConsumed[i] = true;
      guessConsumed[i] = true;
    }
  }

  // Pass 2: yellow / gray
  for (let i = 0; i < len; i++) {
    if (guessConsumed[i]) continue; // already green
    const ch = guess[i]!;
    // Find an unconsumed target letter that matches
    let found = -1;
    for (let j = 0; j < len; j++) {
      if (!targetConsumed[j] && target[j] === ch) {
        found = j;
        break;
      }
    }
    if (found !== -1) {
      marks[i] = "yellow";
      targetConsumed[found] = true;
    } else {
      marks[i] = "gray";
    }
  }

  return marks;
}

export function initialState(seed: number, settings: WordGuessSettings): WordGuessState {
  const rng = mulberry32(seed);
  const wordLength = parseInt(settings.wordLength, 10);
  const maxAttempts = parseInt(settings.maxAttempts, 10);
  const target = pickTarget(wordLength, rng);

  return {
    settings,
    target,
    wordLength,
    maxAttempts,
    current: "",
    attempts: [],
    won: false,
    lost: false,
    error: null,
  };
}

export function reducer(state: WordGuessState, action: WordGuessAction): WordGuessState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "letter": {
      const { char } = action;
      if (!/^[A-Z]$/.test(char)) return state;
      if (state.current.length >= state.wordLength) return state;
      return { ...state, current: state.current + char, error: null };
    }

    case "backspace": {
      if (state.current.length === 0) return state;
      return { ...state, current: state.current.slice(0, -1), error: null };
    }

    case "submit": {
      if (state.current.length !== state.wordLength) {
        return { ...state, error: "too short" };
      }
      if (!isAcceptedGuess(state.current)) {
        return { ...state, error: "not a word" };
      }

      const marks = computeMarks(state.current, state.target);
      const attempt: WordGuessAttempt = { guess: state.current, marks };
      const newAttempts = [...state.attempts, attempt];
      const won = state.current === state.target;
      const lost = !won && newAttempts.length >= state.maxAttempts;

      return {
        ...state,
        attempts: newAttempts,
        current: "",
        error: null,
        won,
        lost,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WordGuessState): { score: number } | null {
  if (state.won) {
    const score = (state.maxAttempts - state.attempts.length + 1) * 100;
    return { score };
  }
  if (state.lost) {
    return { score: 0 };
  }
  return null;
}
