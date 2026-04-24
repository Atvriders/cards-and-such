import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SequencePredictorSettings {
  rounds: "15" | "20" | "30";
  difficulty: "easy" | "medium" | "hard";
}

export type SequenceType = "arithmetic" | "geometric" | "fibonacci";

export interface SequenceQuestion {
  terms: number[];
  answer: number;
  kind: SequenceType;
}

export interface SequencePredictorState {
  settings: SequencePredictorSettings;
  questions: SequenceQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type SequencePredictorAction =
  | { type: "type"; text: string }
  | { type: "submit" };

function rng1(seed: number): number {
  return mulberry32(seed)();
}

function genArithmetic(seed: number, difficulty: string): SequenceQuestion {
  let s = seed;
  const maxStep = difficulty === "easy" ? 5 : difficulty === "medium" ? 15 : 30;
  const start = 1 + Math.floor(rng1(s++) * (difficulty === "easy" ? 10 : 20));
  const step = 1 + Math.floor(rng1(s++) * maxStep);
  const terms = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
  const answer = start + 5 * step;
  return { terms, answer, kind: "arithmetic" };
}

function genGeometric(seed: number, difficulty: string): SequenceQuestion {
  let s = seed;
  const ratioOptions = difficulty === "easy" ? [2, 3] : difficulty === "medium" ? [2, 3, 4] : [2, 3, 4, 5];
  const ratio = ratioOptions[Math.floor(rng1(s++) * ratioOptions.length)]!;
  const start = 1 + Math.floor(rng1(s++) * 3);
  const terms = [start, start * ratio, start * ratio ** 2, start * ratio ** 3, start * ratio ** 4];
  const answer = start * ratio ** 5;
  // Only use if answer is reasonable
  if (answer > 100000) return genArithmetic(seed + 1000, difficulty);
  return { terms, answer, kind: "geometric" };
}

function genFibLike(seed: number, difficulty: string): SequenceQuestion {
  let s = seed;
  const maxStart = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 20;
  const a = 1 + Math.floor(rng1(s++) * maxStart);
  const b = 1 + Math.floor(rng1(s++) * maxStart);
  const c = a + b;
  const d = b + c;
  const e = c + d;
  const answer = d + e;
  return { terms: [a, b, c, d, e], answer, kind: "fibonacci" };
}

function genQuestion(seed: number, difficulty: string): SequenceQuestion {
  const r = mulberry32(seed)();
  if (r < 0.4) return genArithmetic(seed, difficulty);
  if (r < 0.7) return genGeometric(seed, difficulty);
  return genFibLike(seed, difficulty);
}

export function initialState(seed: number, settings: SequencePredictorSettings): SequencePredictorState {
  const count = parseInt(settings.rounds, 10);
  const questions: SequenceQuestion[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(genQuestion(seed + i * 9999, settings.difficulty));
  }
  return {
    settings,
    questions,
    currentIndex: 0,
    typed: "",
    lastResult: null,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: SequencePredictorState, action: SequencePredictorAction): SequencePredictorState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      const cleaned = action.text.replace(/[^0-9-]/g, "").slice(0, 8);
      return { ...state, typed: cleaned, lastResult: null };
    }

    case "submit": {
      if (state.typed === "" || state.typed === "-") return state;
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

export function isTerminal(state: SequencePredictorState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
