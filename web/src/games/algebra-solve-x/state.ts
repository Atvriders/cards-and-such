import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AlgebraSolveXSettings {
  difficulty: "easy" | "medium" | "hard";
  questions: "10" | "20" | "50";
}

// ax + b = c  →  x = (c - b) / a
export interface AlgebraQuestion {
  a: number;   // coefficient (1–5 easy, 1–10 med, 1–20 hard)
  b: number;   // constant added
  c: number;   // right-hand side
  x: number;   // solution
  display: string; // e.g. "3x + 4 = 19"
}

export interface AlgebraSolveXState {
  settings: AlgebraSolveXSettings;
  questions: AlgebraQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type AlgebraSolveXAction =
  | { type: "type"; text: string }
  | { type: "submit" };

function rng1(seed: number): number {
  return mulberry32(seed)();
}

function genQuestion(s: number, difficulty: AlgebraSolveXSettings["difficulty"]): { q: AlgebraQuestion; nextSeed: number } {
  const maxA = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 20;
  const maxX = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
  const maxB = difficulty === "easy" ? 10 : difficulty === "medium" ? 25 : 100;

  const a = 1 + Math.floor(rng1(s++) * maxA);
  const x = 1 + Math.floor(rng1(s++) * maxX);
  const b = Math.floor(rng1(s++) * maxB);
  const c = a * x + b;

  let display: string;
  if (b === 0) {
    display = `${a}x = ${c}`;
  } else {
    display = `${a}x + ${b} = ${c}`;
  }

  return { q: { a, b, c, x, display }, nextSeed: s };
}

function genQuestions(seed: number, settings: AlgebraSolveXSettings): AlgebraQuestion[] {
  const count = parseInt(settings.questions, 10);
  const questions: AlgebraQuestion[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    const { q, nextSeed } = genQuestion(s, settings.difficulty);
    questions.push(q);
    s = nextSeed;
  }
  return questions;
}

export function initialState(seed: number, settings: AlgebraSolveXSettings): AlgebraSolveXState {
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

export function reducer(state: AlgebraSolveXState, action: AlgebraSolveXAction): AlgebraSolveXState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      const cleaned = action.text.replace(/[^0-9]/g, "").slice(0, 4);
      return { ...state, typed: cleaned, lastResult: null };
    }

    case "submit": {
      if (state.typed === "") return state;
      const q = state.questions[state.currentIndex]!;
      const guess = parseInt(state.typed, 10);
      const correct = guess === q.x;
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

export function isTerminal(state: AlgebraSolveXState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
