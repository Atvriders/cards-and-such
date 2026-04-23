import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { SPELLING_BEE_WORDS, filterByDifficulty, isPangram } from "./words.js";

export interface SpellingBeeSettings {
  duration: "60" | "180" | "300";
  difficulty: "easy" | "medium" | "hard";
}

export interface SpellingBeeState {
  settings: SpellingBeeSettings;
  letters: readonly string[];   // 7 letters, index 0 is center
  centerLetter: string;
  validWords: readonly string[]; // all valid answers
  foundWords: readonly string[];
  currentInput: string;
  score: number;
  timeLeft: number;
  gameOver: boolean;
  message: string;
}

export type SpellingBeeAction =
  | { type: "type"; char: string }
  | { type: "delete" }
  | { type: "clear" }
  | { type: "submit" }
  | { type: "tick" };

const LETTER_POOL = "ABCDEFGHIJKLMNOPRSTUW"; // exclude rare letters for nicer puzzles

function generateLetters(rng: () => number): { letters: string[]; center: string } {
  const pool = LETTER_POOL.split("");
  const shuffled = [...pool].sort(() => rng() - 0.5);
  // Pick 7 letters, ensure at least 2 vowels
  const vowels = ["A", "E", "I", "O", "U"];
  const picked: string[] = [];
  const vowelPick = vowels[Math.floor(rng() * vowels.length)]!;
  picked.push(vowelPick);
  for (const l of shuffled) {
    if (picked.length === 7) break;
    if (!picked.includes(l)) picked.push(l);
  }
  // Shuffle the 7
  picked.sort(() => rng() - 0.5);
  const center = picked[0]!;
  return { letters: picked, center };
}

export function initialState(seed: number, settings: SpellingBeeSettings): SpellingBeeState {
  const rng = mulberry32(seed);
  const { letters, center } = generateLetters(rng);
  const validWords = filterByDifficulty(SPELLING_BEE_WORDS, letters, center, settings.difficulty);
  const timeLeft = parseInt(settings.duration, 10);
  return {
    settings,
    letters,
    centerLetter: center,
    validWords,
    foundWords: [],
    currentInput: "",
    score: 0,
    timeLeft,
    gameOver: false,
    message: "",
  };
}

function scoreWord(word: string, letters: readonly string[]): number {
  const len = word.length;
  if (len < 4) return 1;
  const base = len;
  const pangramBonus = isPangram(word, letters) ? 7 : 0;
  return base + pangramBonus;
}

export function reducer(state: SpellingBeeState, action: SpellingBeeAction): SpellingBeeState {
  if (state.gameOver && action.type !== "tick") return state;

  switch (action.type) {
    case "type": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return state;
      return { ...state, currentInput: state.currentInput + ch, message: "" };
    }
    case "delete": {
      return { ...state, currentInput: state.currentInput.slice(0, -1), message: "" };
    }
    case "clear": {
      return { ...state, currentInput: "", message: "" };
    }
    case "submit": {
      const word = state.currentInput.toUpperCase();
      if (word.length < 4) return { ...state, message: "Too short!", currentInput: "" };
      if (!word.includes(state.centerLetter)) {
        return { ...state, message: `Must use ${state.centerLetter}!`, currentInput: "" };
      }
      if (state.foundWords.includes(word)) {
        return { ...state, message: "Already found!", currentInput: "" };
      }
      if (!state.validWords.includes(word)) {
        return { ...state, message: "Not in word list", currentInput: "" };
      }
      const points = scoreWord(word, state.letters);
      const pangramMsg = isPangram(word, state.letters) ? " Pangram! " : "";
      return {
        ...state,
        foundWords: [...state.foundWords, word],
        currentInput: "",
        score: state.score + points,
        message: `+${points}${pangramMsg}`,
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

export function isTerminal(state: SpellingBeeState): { score: number } | null {
  if (state.gameOver) return { score: state.score };
  return null;
}
