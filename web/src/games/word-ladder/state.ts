import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { getDictionary, PUZZLE_PAIRS } from "./dictionary.js";

export interface WordLadderSettings {
  wordLength: "3" | "4" | "5";
  maxMoves: "8" | "12" | "20";
}

export interface WordLadderState {
  settings: WordLadderSettings;
  wordLength: number;
  maxMoves: number;
  start: string;
  target: string;
  current: string;
  history: readonly string[]; // includes start
  inputWord: string;
  error: string | null;
  won: boolean;
  lost: boolean;
}

export type WordLadderAction =
  | { type: "letter"; char: string }
  | { type: "backspace" }
  | { type: "submit" };

export function differsBy1(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffs++;
    if (diffs > 1) return false;
  }
  return diffs === 1;
}

export function initialState(seed: number, settings: WordLadderSettings): WordLadderState {
  const rng = mulberry32(seed);
  const wordLength = parseInt(settings.wordLength, 10);
  const maxMoves = parseInt(settings.maxMoves, 10);

  const pairs = PUZZLE_PAIRS[wordLength] ?? PUZZLE_PAIRS[4]!;
  const idx = Math.floor(rng() * pairs.length);
  const [start, target] = pairs[idx]!;

  return {
    settings,
    wordLength,
    maxMoves,
    start: start.toUpperCase(),
    target: target.toUpperCase(),
    current: start.toUpperCase(),
    history: [start.toUpperCase()],
    inputWord: "",
    error: null,
    won: false,
    lost: false,
  };
}

export function reducer(state: WordLadderState, action: WordLadderAction): WordLadderState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "letter": {
      if (state.inputWord.length >= state.wordLength) return state;
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return state;
      return { ...state, inputWord: state.inputWord + ch, error: null };
    }

    case "backspace": {
      if (state.inputWord.length === 0) return state;
      return { ...state, inputWord: state.inputWord.slice(0, -1), error: null };
    }

    case "submit": {
      const word = state.inputWord.toUpperCase();
      if (word.length !== state.wordLength) {
        return { ...state, error: `Word must be ${state.wordLength} letters` };
      }
      const dict = getDictionary(state.wordLength);
      if (!dict.has(word.toLowerCase())) {
        return { ...state, error: `"${word}" is not in the word list` };
      }
      if (!differsBy1(word, state.current)) {
        return { ...state, error: "Must change exactly one letter" };
      }

      const newHistory = [...state.history, word];
      const won = word === state.target;
      const movesUsed = newHistory.length - 1;
      const lost = !won && movesUsed >= state.maxMoves;

      return {
        ...state,
        current: word,
        history: newHistory,
        inputWord: "",
        error: null,
        won,
        lost,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WordLadderState): { score: number } | null {
  if (!state.won && !state.lost) return null;
  if (state.lost) return { score: 0 };
  const moves = state.history.length - 1;
  return { score: Math.max(100, 1000 - moves * 50) };
}
