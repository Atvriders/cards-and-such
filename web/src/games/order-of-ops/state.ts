import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface OrderOfOpsSettings {
  difficulty: "easy" | "medium" | "hard";
  questions: "10" | "20" | "50";
}

export interface OpsQuestion {
  expression: string;
  answer: number;
}

export interface OrderOfOpsState {
  settings: OrderOfOpsSettings;
  questions: OpsQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type OrderOfOpsAction =
  | { type: "type"; text: string }
  | { type: "submit" };

function rng1(seed: number): number {
  return mulberry32(seed)();
}

function genEasyQuestion(s: number): { q: OpsQuestion; nextSeed: number } {
  // a + b * c  or  a * b + c
  const a = 1 + Math.floor(rng1(s++) * 10);
  const b = 1 + Math.floor(rng1(s++) * 10);
  const c = 1 + Math.floor(rng1(s++) * 10);
  const variant = Math.floor(rng1(s++) * 2);
  let expression: string;
  let answer: number;
  if (variant === 0) {
    expression = `${a} + ${b} × ${c}`;
    answer = a + b * c;
  } else {
    expression = `${a} × ${b} + ${c}`;
    answer = a * b + c;
  }
  return { q: { expression, answer }, nextSeed: s };
}

function genMediumQuestion(s: number): { q: OpsQuestion; nextSeed: number } {
  // (a + b) * c  or  a * (b + c)  or  a + b * c - d
  const a = 1 + Math.floor(rng1(s++) * 12);
  const b = 1 + Math.floor(rng1(s++) * 12);
  const c = 1 + Math.floor(rng1(s++) * 10);
  const d = 1 + Math.floor(rng1(s++) * 8);
  const variant = Math.floor(rng1(s++) * 3);
  let expression: string;
  let answer: number;
  if (variant === 0) {
    expression = `(${a} + ${b}) × ${c}`;
    answer = (a + b) * c;
  } else if (variant === 1) {
    expression = `${a} × (${b} + ${c})`;
    answer = a * (b + c);
  } else {
    expression = `${a} + ${b} × ${c} − ${d}`;
    answer = a + b * c - d;
  }
  return { q: { expression, answer }, nextSeed: s };
}

function genHardQuestion(s: number): { q: OpsQuestion; nextSeed: number } {
  // a * b + c * d  or  (a + b) * (c - d)  or  a^2 + b * c
  const a = 2 + Math.floor(rng1(s++) * 8);
  const b = 2 + Math.floor(rng1(s++) * 8);
  const c = 1 + Math.floor(rng1(s++) * 10);
  const d = 1 + Math.floor(rng1(s++) * 5);
  const variant = Math.floor(rng1(s++) * 3);
  let expression: string;
  let answer: number;
  if (variant === 0) {
    expression = `${a} × ${b} + ${c} × ${d}`;
    answer = a * b + c * d;
  } else if (variant === 1) {
    // ensure c > d to keep positive
    const big = Math.max(c, d) + 2;
    const small = 1 + Math.floor(rng1(s++) * (big - 1));
    expression = `(${a} + ${b}) × (${big} − ${small})`;
    answer = (a + b) * (big - small);
  } else {
    expression = `${a}² + ${b} × ${c}`;
    answer = a * a + b * c;
  }
  return { q: { expression, answer }, nextSeed: s };
}

function genQuestions(seed: number, settings: OrderOfOpsSettings): OpsQuestion[] {
  const count = parseInt(settings.questions, 10);
  const questions: OpsQuestion[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    let result: { q: OpsQuestion; nextSeed: number };
    if (settings.difficulty === "easy") {
      result = genEasyQuestion(s);
    } else if (settings.difficulty === "medium") {
      result = genMediumQuestion(s);
    } else {
      result = genHardQuestion(s);
    }
    questions.push(result.q);
    s = result.nextSeed;
  }
  return questions;
}

export function initialState(seed: number, settings: OrderOfOpsSettings): OrderOfOpsState {
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

export function reducer(state: OrderOfOpsState, action: OrderOfOpsAction): OrderOfOpsState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      const cleaned = action.text.replace(/[^0-9]/g, "").slice(0, 6);
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

export function isTerminal(state: OrderOfOpsState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
