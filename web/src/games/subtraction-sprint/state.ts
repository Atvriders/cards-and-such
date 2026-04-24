import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SubtractionSprintSettings {
  difficulty: "easy" | "medium" | "hard";
  questions: "10" | "20" | "50";
}

export interface SubtractionQuestion {
  a: number;
  b: number;
  answer: number;
}

export interface SubtractionSprintState {
  settings: SubtractionSprintSettings;
  questions: SubtractionQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type SubtractionSprintAction =
  | { type: "type"; text: string }
  | { type: "submit" };

function rng1(seed: number): number {
  return mulberry32(seed)();
}

function genQuestions(seed: number, settings: SubtractionSprintSettings): SubtractionQuestion[] {
  const max = settings.difficulty === "easy" ? 20 : settings.difficulty === "medium" ? 100 : 999;
  const count = parseInt(settings.questions, 10);
  const questions: SubtractionQuestion[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    const a = 1 + Math.floor(rng1(s++) * max);
    const b = 1 + Math.floor(rng1(s++) * (a));
    // ensure b <= a so answer >= 0
    questions.push({ a, b, answer: a - b });
  }
  return questions;
}

export function initialState(seed: number, settings: SubtractionSprintSettings): SubtractionSprintState {
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

export function reducer(state: SubtractionSprintState, action: SubtractionSprintAction): SubtractionSprintState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      const cleaned = action.text.replace(/[^0-9]/g, "").slice(0, 5);
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

export function isTerminal(state: SubtractionSprintState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
