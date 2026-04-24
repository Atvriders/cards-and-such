import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ExponentDrillSettings {
  difficulty: "easy" | "medium" | "hard";
  questions: "10" | "20" | "50";
}

export interface ExponentQuestion {
  base: number;
  exp: number;
  answer: number;
  display: string;
}

export interface ExponentDrillState {
  settings: ExponentDrillSettings;
  questions: ExponentQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type ExponentDrillAction =
  | { type: "type"; text: string }
  | { type: "submit" };

function rng1(seed: number): number {
  return mulberry32(seed)();
}

function genQuestions(seed: number, settings: ExponentDrillSettings): ExponentQuestion[] {
  // easy:   base 2-5,  exp 2-4  → answers up to 625
  // medium: base 2-10, exp 2-4  → answers up to 10000
  // hard:   base 2-12, exp 2-5  → answers up to 248832
  const [maxBase, maxExp] = settings.difficulty === "easy" ? [5, 4] :
                             settings.difficulty === "medium" ? [10, 4] : [12, 5];
  const count = parseInt(settings.questions, 10);
  const questions: ExponentQuestion[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    const base = 2 + Math.floor(rng1(s++) * (maxBase - 1));
    const exp = 2 + Math.floor(rng1(s++) * (maxExp - 1));
    const answer = Math.pow(base, exp);
    const display = `${base}^${exp}`;
    questions.push({ base, exp, answer, display });
  }
  return questions;
}

export function initialState(seed: number, settings: ExponentDrillSettings): ExponentDrillState {
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

export function reducer(state: ExponentDrillState, action: ExponentDrillAction): ExponentDrillState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      const cleaned = action.text.replace(/[^0-9]/g, "").slice(0, 7);
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

export function isTerminal(state: ExponentDrillState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
