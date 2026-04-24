import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RomanNumeralsSettings {
  direction: "to-roman" | "to-arabic";
  difficulty: "easy" | "medium" | "hard";
  questions: "10" | "20" | "50";
}

export interface RomanQuestion {
  arabic: number;
  roman: string;
  // If direction=="to-roman", user types the roman; if "to-arabic", user types the arabic
}

export interface RomanNumeralsState {
  settings: RomanNumeralsSettings;
  questions: RomanQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type RomanNumeralsAction =
  | { type: "type"; text: string }
  | { type: "submit" };

const ROMAN_MAP: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"],  [90, "XC"],  [50, "L"],  [40, "XL"],
  [10, "X"],   [9, "IX"],   [5, "V"],   [4, "IV"],
  [1, "I"],
];

export function toRoman(n: number): string {
  let result = "";
  let remaining = n;
  for (const [value, numeral] of ROMAN_MAP) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}

function rng1(seed: number): number {
  return mulberry32(seed)();
}

function genQuestions(seed: number, settings: RomanNumeralsSettings): RomanQuestion[] {
  const [lo, hi] = settings.difficulty === "easy" ? [1, 20] :
                   settings.difficulty === "medium" ? [1, 100] : [1, 3999];
  const count = parseInt(settings.questions, 10);
  const questions: RomanQuestion[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    const arabic = lo + Math.floor(rng1(s++) * (hi - lo + 1));
    const roman = toRoman(arabic);
    questions.push({ arabic, roman });
  }
  return questions;
}

export function initialState(seed: number, settings: RomanNumeralsSettings): RomanNumeralsState {
  return {
    settings,
    questions: genQuestions(seed, settings),
    currentIndex: 0,
    typed: "",
    lastResult: null,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: RomanNumeralsState, action: RomanNumeralsAction): RomanNumeralsState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      let cleaned: string;
      if (state.settings.direction === "to-roman") {
        cleaned = action.text.toUpperCase().replace(/[^IVXLCDM]/g, "").slice(0, 15);
      } else {
        cleaned = action.text.replace(/[^0-9]/g, "").slice(0, 4);
      }
      return { ...state, typed: cleaned, lastResult: null };
    }

    case "submit": {
      if (state.typed === "") return state;
      const q = state.questions[state.currentIndex]!;
      let correct: boolean;
      if (state.settings.direction === "to-roman") {
        correct = state.typed.toUpperCase() === q.roman;
      } else {
        correct = parseInt(state.typed, 10) === q.arabic;
      }
      const nextIndex = state.currentIndex + 1;
      const done = nextIndex >= state.questions.length;
      return {
        ...state,
        typed: "",
        lastResult: correct ? "correct" : "wrong",
        score: correct ? state.score + 10 : state.score,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
        currentIndex: nextIndex,
        phase: done ? "done" : "playing",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RomanNumeralsState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
