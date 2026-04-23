import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { ALL_PREFIXES, PREFIX_WORDS, isValidPrefixWord } from "./words.js";

export interface WordConstructionSettings {
  duration: "60" | "90";
}

export interface WordConstructionState {
  settings: WordConstructionSettings;
  prefixes: string[];       // active prefixes for this round
  currentPrefix: string;    // which prefix is currently selected
  foundWords: Record<string, string[]>; // prefix -> found words
  currentInput: string;
  score: number;
  timeLeft: number;
  gameOver: boolean;
  message: string;
}

export type WordConstructionAction =
  | { type: "selectPrefix"; prefix: string }
  | { type: "type"; char: string }
  | { type: "delete" }
  | { type: "clear" }
  | { type: "submit" }
  | { type: "tick" };

export function initialState(seed: number, settings: WordConstructionSettings): WordConstructionState {
  const rng = mulberry32(seed);
  // Pick 4 random prefixes
  const shuffled = [...ALL_PREFIXES].sort(() => rng() - 0.5);
  const prefixes = shuffled.slice(0, 4);
  const currentPrefix = prefixes[0]!;
  const foundWords: Record<string, string[]> = {};
  for (const p of prefixes) foundWords[p] = [];
  const timeLeft = parseInt(settings.duration, 10);
  return {
    settings,
    prefixes,
    currentPrefix,
    foundWords,
    currentInput: "",
    score: 0,
    timeLeft,
    gameOver: false,
    message: `Type a word starting with "${currentPrefix}"`,
  };
}

export function reducer(state: WordConstructionState, action: WordConstructionAction): WordConstructionState {
  if (state.gameOver && action.type !== "tick") return state;

  switch (action.type) {
    case "selectPrefix": {
      if (!state.prefixes.includes(action.prefix)) return state;
      return { ...state, currentPrefix: action.prefix, currentInput: "", message: `Type a word starting with "${action.prefix}"` };
    }
    case "type": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return state;
      return { ...state, currentInput: state.currentInput + ch, message: "" };
    }
    case "delete":
      return { ...state, currentInput: state.currentInput.slice(0, -1), message: "" };
    case "clear":
      return { ...state, currentInput: "", message: "" };
    case "submit": {
      const word = state.currentInput.toUpperCase();
      const prefix = state.currentPrefix;

      if (!word.startsWith(prefix)) {
        return { ...state, message: `Must start with "${prefix}"`, currentInput: "" };
      }
      if (word.length < prefix.length + 1) {
        return { ...state, message: "Too short!", currentInput: "" };
      }
      const existing = state.foundWords[prefix] ?? [];
      if (existing.includes(word)) {
        return { ...state, message: "Already found!", currentInput: "" };
      }
      if (!isValidPrefixWord(word, prefix)) {
        // Try ALL prefixes in case the word uses a different prefix
        const validForAny = state.prefixes.find(p => isValidPrefixWord(word, p));
        if (validForAny) {
          return { ...state, message: `"${word}" is for prefix ${validForAny}`, currentInput: "" };
        }
        return { ...state, message: "Not in word list", currentInput: "" };
      }

      // Check not already found under another prefix
      for (const p of state.prefixes) {
        if (p !== prefix && (state.foundWords[p] ?? []).includes(word)) {
          return { ...state, message: "Already found!", currentInput: "" };
        }
      }

      const newFoundWords = {
        ...state.foundWords,
        [prefix]: [...existing, word],
      };
      const points = word.length * 5;
      return {
        ...state,
        foundWords: newFoundWords,
        currentInput: "",
        score: state.score + points,
        message: `+${points}`,
      };
    }
    case "tick": {
      if (state.gameOver) return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, gameOver: true, message: "Time's up!" };
      return { ...state, timeLeft: newTime };
    }
    default:
      return state;
  }
}

export function isTerminal(state: WordConstructionState): { score: number } | null {
  if (state.gameOver) return { score: state.score };
  return null;
}

export function getPrefixWordCount(prefix: string): number {
  return (PREFIX_WORDS[prefix] ?? []).length;
}
