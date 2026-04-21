import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { pickWord, scramble, sameLetters, ANAGRAM_WORDS } from "./words.js";

export interface AnagramSettings {
  wordLength: "5" | "6" | "7";
  maxGuesses: "3" | "5" | "10";
}

export interface AnagramState {
  settings: AnagramSettings;
  wordLength: number;
  maxGuesses: number;
  target: string;       // original word (uppercase)
  scrambled: string;    // scrambled version shown to player
  currentGuess: string;
  guesses: readonly string[];
  won: boolean;
  lost: boolean;
}

export type AnagramAction =
  | { type: "letter"; char: string }
  | { type: "backspace" }
  | { type: "submit" };

export function initialState(seed: number, settings: AnagramSettings): AnagramState {
  const rng = mulberry32(seed);
  const wordLength = parseInt(settings.wordLength, 10);
  const maxGuesses = parseInt(settings.maxGuesses, 10);

  const target = pickWord(wordLength, rng);
  const sc = scramble(target, rng);

  return {
    settings,
    wordLength,
    maxGuesses,
    target,
    scrambled: sc,
    currentGuess: "",
    guesses: [],
    won: false,
    lost: false,
  };
}

export function reducer(state: AnagramState, action: AnagramAction): AnagramState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "letter": {
      if (state.currentGuess.length >= state.wordLength) return state;
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return state;
      return { ...state, currentGuess: state.currentGuess + ch };
    }

    case "backspace": {
      if (state.currentGuess.length === 0) return state;
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
    }

    case "submit": {
      const guess = state.currentGuess.toUpperCase();
      if (guess.length !== state.wordLength) return state;

      // Must use the same letters as the scrambled set
      if (!sameLetters(guess, state.target)) {
        const newGuesses = [...state.guesses, guess];
        const lost = newGuesses.length >= state.maxGuesses;
        return { ...state, currentGuess: "", guesses: newGuesses, lost };
      }

      // Check if it matches target
      const won = guess === state.target;
      const newGuesses = [...state.guesses, guess];
      const lost = !won && newGuesses.length >= state.maxGuesses;

      return { ...state, currentGuess: "", guesses: newGuesses, won, lost };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AnagramState): { score: number } | null {
  if (!state.won && !state.lost) return null;
  if (state.lost) return { score: 0 };
  const attemptsUsed = state.guesses.length;
  return { score: Math.max(100, (state.maxGuesses - attemptsUsed + 1) * 200) };
}

// Re-export for tests
export { ANAGRAM_WORDS, sameLetters };
