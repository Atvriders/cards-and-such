import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TimesTablesSettings {
  tables: "1-5" | "1-10" | "1-12";
  questions: "10" | "20" | "50";
}

export interface TimesTablesQuestion {
  a: number;
  b: number;
  answer: number;
}

export interface TimesTablesState {
  settings: TimesTablesSettings;
  questions: TimesTablesQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type TimesTablesAction =
  | { type: "type"; text: string }
  | { type: "submit" };

function rng1(seed: number): number {
  const r = mulberry32(seed);
  return r();
}

function genQuestions(seed: number, settings: TimesTablesSettings): TimesTablesQuestion[] {
  const maxTable = settings.tables === "1-5" ? 5 : settings.tables === "1-10" ? 10 : 12;
  const count = parseInt(settings.questions, 10);
  const questions: TimesTablesQuestion[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    const a = 1 + Math.floor(rng1(s++) * maxTable);
    const b = 1 + Math.floor(rng1(s++) * maxTable);
    questions.push({ a, b, answer: a * b });
  }
  return questions;
}

export function initialState(seed: number, settings: TimesTablesSettings): TimesTablesState {
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

export function reducer(state: TimesTablesState, action: TimesTablesAction): TimesTablesState {
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

export function isTerminal(state: TimesTablesState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
