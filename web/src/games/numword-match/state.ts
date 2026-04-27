import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Numword Match: 20 rounds. A digit is shown; pick the matching word from 4 options.

export const TOTAL_ROUNDS = 20;

export interface NumwordMatchSettings { dummy: boolean; }

export interface NumwordRound {
  digit: number;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface NumwordMatchState {
  rounds: NumwordRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type NumwordMatchAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

export const NUMBER_WORDS: Record<number, string> = {
  0: "zero", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine",
  10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen",
  20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety", 100: "one hundred",
};

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function genRounds(rng: () => number): NumwordRound[] {
  const keys = Object.keys(NUMBER_WORDS).map(Number);
  const out: NumwordRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const digit = keys[Math.floor(rng() * keys.length)]!;
    const correctWord = NUMBER_WORDS[digit]!;
    const wrongWords = new Set<string>();
    while (wrongWords.size < 3) {
      const k = keys[Math.floor(rng() * keys.length)]!;
      const w = NUMBER_WORDS[k]!;
      if (w !== correctWord) wrongWords.add(w);
    }
    const choices = shuffle([correctWord, ...wrongWords], rng);
    const correctIdx = choices.indexOf(correctWord) as 0 | 1 | 2 | 3;
    out.push({ digit, choices: choices as [string, string, string, string], correct: correctIdx });
  }
  return out;
}

export function initialState(seed: number, _s: NumwordMatchSettings): NumwordMatchState {
  const rng = mulberry32(seed);
  return {
    rounds: genRounds(rng),
    currentIndex: 0,
    selected: null,
    submitted: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: NumwordMatchState, action: NumwordMatchAction): NumwordMatchState {
  if (state.phase === "done") return state;
  if (action.type === "select") {
    if (state.submitted) return state;
    return { ...state, selected: action.choice };
  }
  if (action.type === "submit") {
    if (state.submitted || state.selected === null) return state;
    const r = state.rounds[state.currentIndex]!;
    const ok = state.selected === r.correct;
    return {
      ...state,
      submitted: true,
      score: state.score + (ok ? 10 : 0),
      correctCount: state.correctCount + (ok ? 1 : 0),
      phase: "result",
    };
  }
  if (action.type === "next") {
    const ni = state.currentIndex + 1;
    if (ni >= state.rounds.length) return { ...state, phase: "done" };
    return { ...state, currentIndex: ni, selected: null, submitted: false, phase: "playing" };
  }
  return state;
}

export function isTerminal(state: NumwordMatchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
