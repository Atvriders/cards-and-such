import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { WORD_LIST_5, WORD_LIST_6, WORD_LIST_7, canFormFrom, getWordList } from "./words.js";
import type { WordLength } from "./words.js";

export interface TextTwistSettings {
  duration: "120" | "180";
  targetWordLength: "5" | "6" | "7";
}

export interface TextTwistState {
  settings: TextTwistSettings;
  targetWord: string;       // the required word to advance
  letters: string[];        // scrambled letters shown to player
  validWords: string[];     // all valid subwords
  foundWords: string[];
  currentInput: string;
  score: number;
  timeLeft: number;
  gameOver: boolean;
  message: string;
  solved: boolean;          // found the target word
}

export type TextTwistAction =
  | { type: "type"; char: string }
  | { type: "delete" }
  | { type: "clear" }
  | { type: "submit" }
  | { type: "twist" }     // re-scramble letters
  | { type: "tick" };

function pickTargetWord(rng: () => number, targetLen: number): string {
  let pool: readonly string[];
  if (targetLen === 5) pool = WORD_LIST_5;
  else if (targetLen === 6) pool = WORD_LIST_6;
  else pool = WORD_LIST_7;
  const filtered = pool.filter(w => w.length === targetLen);
  return filtered[Math.floor(rng() * filtered.length)] ?? "PLANET";
}

function scramble(arr: string[], rng: () => number): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function findValidSubwords(targetLetters: string[]): string[] {
  const results: string[] = [];
  for (let len = 3; len <= targetLetters.length; len++) {
    for (const w of getWordList(len as WordLength)) {
      if (w.length === len && canFormFrom(w, targetLetters)) {
        results.push(w);
      }
    }
  }
  return results;
}

export function initialState(seed: number, settings: TextTwistSettings): TextTwistState {
  const rng = mulberry32(seed);
  const targetLen = parseInt(settings.targetWordLength, 10);
  const targetWord = pickTargetWord(rng, targetLen);
  const letters = scramble(targetWord.split(""), rng);
  const validWords = findValidSubwords(letters);
  const timeLeft = parseInt(settings.duration, 10);
  return {
    settings,
    targetWord,
    letters,
    validWords,
    foundWords: [],
    currentInput: "",
    score: 0,
    timeLeft,
    gameOver: false,
    message: "",
    solved: false,
  };
}

export function reducer(state: TextTwistState, action: TextTwistAction): TextTwistState {
  if (state.gameOver && action.type !== "tick") return state;

  switch (action.type) {
    case "type": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return state;
      // Check ch is in remaining letters
      const used = state.currentInput.split("");
      const avail = [...state.letters];
      for (const u of used) {
        const idx = avail.indexOf(u);
        if (idx !== -1) avail.splice(idx, 1);
      }
      if (!avail.includes(ch)) return { ...state, message: "Letter not available" };
      return { ...state, currentInput: state.currentInput + ch, message: "" };
    }
    case "delete":
      return { ...state, currentInput: state.currentInput.slice(0, -1), message: "" };
    case "clear":
      return { ...state, currentInput: "", message: "" };
    case "twist": {
      const rng = mulberry32(state.timeLeft);
      return { ...state, letters: scramble([...state.letters], rng), message: "" };
    }
    case "submit": {
      const word = state.currentInput.toUpperCase();
      if (word.length < 3) return { ...state, message: "Too short!", currentInput: "" };
      if (state.foundWords.includes(word)) return { ...state, message: "Already found!", currentInput: "" };
      if (!state.validWords.includes(word)) return { ...state, message: "Not a valid word", currentInput: "" };
      const isSolved = word === state.targetWord;
      const bonus = isSolved ? 50 : 0;
      const points = word.length * 10 + bonus;
      return {
        ...state,
        foundWords: [...state.foundWords, word],
        currentInput: "",
        score: state.score + points,
        message: isSolved ? "Target found! +" + points : "+" + points,
        solved: state.solved || isSolved,
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

export function isTerminal(state: TextTwistState): { score: number } | null {
  if (state.gameOver) return { score: state.score };
  return null;
}
