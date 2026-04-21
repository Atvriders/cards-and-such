import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { HANGMAN_WORDS, filterByLength } from "./words.js";

export interface HangmanSettings {
  wordLength: "any" | "short" | "medium" | "long";
  maxWrong: "6" | "8" | "10";
}

export interface HangmanState {
  settings: HangmanSettings;
  target: string;                   // uppercase
  guessed: readonly string[];       // letters tried (uppercase), in order
  wrongGuesses: number;
  maxWrongNum: number;
  won: boolean;
  lost: boolean;
}

export type HangmanAction = { type: "guess"; letter: string };

function pickTarget(seed: number, settings: HangmanSettings): string {
  const pool = filterByLength(HANGMAN_WORDS, settings.wordLength);
  const words = pool.length > 0 ? pool : HANGMAN_WORDS;
  const rng = mulberry32(seed);
  const index = Math.floor(rng() * words.length);
  return words[index]!;
}

export function initialState(seed: number, settings: HangmanSettings): HangmanState {
  const target = pickTarget(seed, settings);
  const maxWrongNum = parseInt(settings.maxWrong, 10);
  return {
    settings,
    target,
    guessed: [],
    wrongGuesses: 0,
    maxWrongNum,
    won: false,
    lost: false,
  };
}

export function reducer(state: HangmanState, action: HangmanAction): HangmanState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "guess": {
      const letter = action.letter.toUpperCase();
      // Validate: must be A-Z single letter and not already guessed
      if (!/^[A-Z]$/.test(letter)) return state;
      if (state.guessed.includes(letter)) return state;

      const newGuessed = [...state.guessed, letter];
      const isWrong = !state.target.includes(letter);
      const newWrongGuesses = isWrong ? state.wrongGuesses + 1 : state.wrongGuesses;

      // Check win: every letter in target has been guessed
      const won = state.target.split("").every(c => newGuessed.includes(c));
      // Check loss
      const lost = newWrongGuesses >= state.maxWrongNum;

      return {
        ...state,
        guessed: newGuessed,
        wrongGuesses: newWrongGuesses,
        won,
        lost,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: HangmanState): { score: number } | null {
  if (state.won) {
    const score = (state.maxWrongNum - state.wrongGuesses) * 50 + state.target.length * 10;
    return { score };
  }
  if (state.lost) {
    return { score: 0 };
  }
  return null;
}
