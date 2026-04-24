import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PercentCalculatorSettings {
  rounds: "20" | "30" | "50";
  difficulty: "easy" | "medium" | "hard";
}

export interface PercentQuestion {
  display: string;
  answer: number;
}

export interface PercentCalculatorState {
  settings: PercentCalculatorSettings;
  questions: PercentQuestion[];
  currentIndex: number;
  typed: string;
  timeLeft: number;
  totalTime: number;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type PercentCalculatorAction =
  | { type: "type"; text: string }
  | { type: "submit" }
  | { type: "tick"; dt: number };

function rng1(seed: number): number {
  return mulberry32(seed)();
}

const EASY_PERCENTS = [10, 20, 25, 50, 75];
const MEDIUM_PERCENTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80];
const HARD_PERCENTS = [5, 10, 12, 15, 17, 20, 22, 25, 30, 33, 40, 45, 50, 60, 66, 75, 80, 90];

function genQuestion(seed: number, difficulty: string): PercentQuestion {
  let s = seed;
  const percents = difficulty === "easy" ? EASY_PERCENTS : difficulty === "medium" ? MEDIUM_PERCENTS : HARD_PERCENTS;
  const pct = percents[Math.floor(rng1(s++) * percents.length)]!;

  let base: number;
  if (difficulty === "easy") {
    // multiples of 10 or 20
    base = (1 + Math.floor(rng1(s++) * 10)) * 10;
  } else if (difficulty === "medium") {
    base = (1 + Math.floor(rng1(s++) * 20)) * 5;
  } else {
    base = 10 + Math.floor(rng1(s++) * 190);
  }

  const answer = Math.round((pct / 100) * base * 10) / 10;
  return { display: `${pct}% of ${base}`, answer };
}

export function initialState(seed: number, settings: PercentCalculatorSettings): PercentCalculatorState {
  const count = parseInt(settings.rounds, 10);
  const questions: PercentQuestion[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(genQuestion(seed + i * 7331, settings.difficulty));
  }
  const totalTime = 90;
  return {
    settings,
    questions,
    currentIndex: 0,
    typed: "",
    timeLeft: totalTime,
    totalTime,
    lastResult: null,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: PercentCalculatorState, action: PercentCalculatorAction): PercentCalculatorState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "tick": {
      const newTime = state.timeLeft - action.dt;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, phase: "done" };
      }
      return { ...state, timeLeft: newTime };
    }

    case "type": {
      const cleaned = action.text.replace(/[^0-9.]/g, "").slice(0, 8);
      return { ...state, typed: cleaned, lastResult: null };
    }

    case "submit": {
      if (state.typed === "") return state;
      const q = state.questions[state.currentIndex]!;
      const guess = parseFloat(state.typed);
      const correct = Math.abs(guess - q.answer) < 0.05;
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

export function isTerminal(state: PercentCalculatorState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
