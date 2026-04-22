import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES, getAllLetters, isValidWordForBox } from "./puzzles.js";

export interface LetterBoxedSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface LetterBoxedState {
  settings: LetterBoxedSettings;
  puzzleIdx: number;
  sides: [string, string, string, string];
  allLetters: string[];      // all 12 letters
  usedLetters: Set<string>;  // letters covered so far
  words: string[];           // words played so far
  currentInput: string;      // current word being typed
  error: string | null;
  won: boolean;
  score: number;
  lastLetter: string | null; // last letter of previous word
}

export type LetterBoxedAction =
  | { type: "typeChar"; char: string }
  | { type: "backspace" }
  | { type: "submitWord" }
  | { type: "clearInput" };

function selectPuzzle(difficulty: LetterBoxedSettings["difficulty"], rng: () => number): number {
  const matching = PUZZLES.map((p, i) => ({ p, i })).filter(({ p }) => p.difficulty === difficulty);
  const pool = matching.length > 0 ? matching : PUZZLES.map((p, i) => ({ p, i }));
  return pool[Math.floor(rng() * pool.length)]!.i;
}

export function initialState(seed: number, settings: LetterBoxedSettings): LetterBoxedState {
  const rng = mulberry32(seed);
  const puzzleIdx = selectPuzzle(settings.difficulty, rng);
  const puzzle = PUZZLES[puzzleIdx]!;
  const allLetters = [...getAllLetters(puzzle.sides)];

  return {
    settings,
    puzzleIdx,
    sides: puzzle.sides,
    allLetters,
    usedLetters: new Set(),
    words: [],
    currentInput: "",
    error: null,
    won: false,
    score: 0,
    lastLetter: null,
  };
}

export function reducer(state: LetterBoxedState, action: LetterBoxedAction): LetterBoxedState {
  if (state.won) return state;

  switch (action.type) {
    case "typeChar": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return state;
      return { ...state, currentInput: state.currentInput + ch, error: null };
    }

    case "backspace": {
      if (state.currentInput.length === 0) return state;
      return { ...state, currentInput: state.currentInput.slice(0, -1), error: null };
    }

    case "clearInput":
      return { ...state, currentInput: "", error: null };

    case "submitWord": {
      const word = state.currentInput.trim().toUpperCase();
      if (word.length < 3) {
        return { ...state, currentInput: "", error: "Word must be at least 3 letters" };
      }

      // Check already used
      if (state.words.includes(word)) {
        return { ...state, currentInput: "", error: "Already used that word" };
      }

      const validation = isValidWordForBox(word, state.sides, state.lastLetter);
      if (!validation.valid) {
        return { ...state, currentInput: "", error: validation.reason ?? "Invalid word" };
      }

      // Update used letters
      const usedLetters = new Set(state.usedLetters);
      for (const ch of word) usedLetters.add(ch);

      const won = state.allLetters.every(l => usedLetters.has(l));
      const words = [...state.words, word];
      const lastLetter = word[word.length - 1]!;

      // Score: bonus for few words, points per letter used
      const score = won ? Math.max(100, 500 - (words.length - 1) * 100) + usedLetters.size * 5 : 0;

      return {
        ...state,
        words,
        usedLetters,
        currentInput: "",
        error: null,
        won,
        score,
        lastLetter,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: LetterBoxedState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
