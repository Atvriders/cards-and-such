import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PrimeFactorSettings {
  difficulty: "easy" | "medium" | "hard";
  questions: "10" | "20" | "50";
}

export interface PrimeFactorQuestion {
  number: number;
  // Smallest prime factor
  answer: number;
}

export interface PrimeFactorState {
  settings: PrimeFactorSettings;
  questions: PrimeFactorQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type PrimeFactorAction =
  | { type: "type"; text: string }
  | { type: "submit" };

const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

function smallestPrimeFactor(n: number): number {
  for (const p of SMALL_PRIMES) {
    if (n % p === 0) return p;
  }
  return n; // n is prime
}

function rng1(seed: number): number {
  return mulberry32(seed)();
}

function genQuestions(seed: number, settings: PrimeFactorSettings): PrimeFactorQuestion[] {
  // easy: composite numbers 4–50
  // medium: composite numbers 20–200
  // hard: composite numbers 100–500
  const [lo, hi] = settings.difficulty === "easy" ? [4, 50] :
                   settings.difficulty === "medium" ? [20, 200] : [100, 500];
  const count = parseInt(settings.questions, 10);
  const questions: PrimeFactorQuestion[] = [];
  let s = seed;
  while (questions.length < count) {
    const n = lo + Math.floor(rng1(s++) * (hi - lo + 1));
    const spf = smallestPrimeFactor(n);
    if (spf !== n) { // composite only
      questions.push({ number: n, answer: spf });
    }
  }
  return questions.slice(0, count);
}

export function initialState(seed: number, settings: PrimeFactorSettings): PrimeFactorState {
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

export function reducer(state: PrimeFactorState, action: PrimeFactorAction): PrimeFactorState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      const cleaned = action.text.replace(/[^0-9]/g, "").slice(0, 3);
      return { ...state, typed: cleaned, lastResult: null };
    }

    case "submit": {
      if (state.typed === "") return state;
      const q = state.questions[state.currentIndex]!;
      const guess = parseInt(state.typed, 10);
      const correct = guess === q.answer;
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

export function isTerminal(state: PrimeFactorState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
