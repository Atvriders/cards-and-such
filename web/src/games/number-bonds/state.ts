import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NumberBondsSettings {
  target: "10" | "20" | "100";
  questions: "10" | "20" | "50";
}

export interface NumberBondQuestion {
  target: number;
  given: number;   // one part
  answer: number;  // the missing part
}

export interface NumberBondsState {
  settings: NumberBondsSettings;
  questions: NumberBondQuestion[];
  currentIndex: number;
  typed: string;
  lastResult: "correct" | "wrong" | null;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type NumberBondsAction =
  | { type: "type"; text: string }
  | { type: "submit" };

function rng1(seed: number): number {
  return mulberry32(seed)();
}

function genQuestions(seed: number, settings: NumberBondsSettings): NumberBondQuestion[] {
  const target = parseInt(settings.target, 10);
  const count = parseInt(settings.questions, 10);
  const questions: NumberBondQuestion[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    // given is 0..target inclusive
    const given = Math.floor(rng1(s++) * (target + 1));
    const answer = target - given;
    questions.push({ target, given, answer });
  }
  return questions;
}

export function initialState(seed: number, settings: NumberBondsSettings): NumberBondsState {
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

export function reducer(state: NumberBondsState, action: NumberBondsAction): NumberBondsState {
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

export function isTerminal(state: NumberBondsState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
