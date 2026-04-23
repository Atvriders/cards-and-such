import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { isValidChainWord } from "./words.js";

export interface WordChainSettings {
  duration: "60" | "120";
  startLetter?: string; // auto-seeded
}

export interface WordChainState {
  settings: WordChainSettings;
  startLetter: string;
  chain: string[];        // words submitted so far
  currentInput: string;
  score: number;
  timeLeft: number;
  gameOver: boolean;
  message: string;
}

export type WordChainAction =
  | { type: "type"; char: string }
  | { type: "delete" }
  | { type: "clear" }
  | { type: "submit" }
  | { type: "tick" };

const COMMON_LETTERS = "ABCDEFGHILMNOPRSTW";

export function initialState(seed: number, settings: WordChainSettings): WordChainState {
  const rng = mulberry32(seed);
  const startLetter = settings.startLetter?.toUpperCase() ??
    COMMON_LETTERS[Math.floor(rng() * COMMON_LETTERS.length)]!;
  const timeLeft = parseInt(settings.duration, 10);
  return {
    settings,
    startLetter,
    chain: [],
    currentInput: "",
    score: 0,
    timeLeft,
    gameOver: false,
    message: `Start with a word beginning with "${startLetter}"`,
  };
}

function nextRequired(chain: string[], startLetter: string): string {
  if (chain.length === 0) return startLetter;
  const last = chain[chain.length - 1]!;
  return last[last.length - 1]!.toUpperCase();
}

export function reducer(state: WordChainState, action: WordChainAction): WordChainState {
  if (state.gameOver && action.type !== "tick") return state;

  switch (action.type) {
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
      if (word.length < 3) return { ...state, message: "Too short!", currentInput: "" };

      const required = nextRequired(state.chain, state.startLetter);
      if (word[0] !== required) {
        return { ...state, message: `Must start with "${required}"`, currentInput: "" };
      }

      if (state.chain.includes(word)) {
        return { ...state, message: "Already used!", currentInput: "" };
      }

      if (!isValidChainWord(word)) {
        return { ...state, message: "Not a valid word", currentInput: "" };
      }

      const points = word.length;
      const nextLetter = word[word.length - 1]!.toUpperCase();
      return {
        ...state,
        chain: [...state.chain, word],
        currentInput: "",
        score: state.score + points,
        message: `+${points} — next: "${nextLetter}"`,
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

export function isTerminal(state: WordChainState): { score: number } | null {
  if (state.gameOver) return { score: state.score };
  return null;
}
