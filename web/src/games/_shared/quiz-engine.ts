// Shared quiz / trivia engine used by all party-trivia adaptations
// (Telestrations, Charades, Monikers, Fibbage, Drawful, Quiplash, Dixit,
// Wits & Wagers, Apples to Apples, Pictionary, Loaded Questions, Tee K.O.,
// Jackbox, Spyfall, Werewolf, Avalon, etc.).
//
// 10 multi-choice questions per quiz. The player picks the correct answer
// from 4 options. Points = 10 base + time bonus (up to +5) + streak bonus.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  q: string;
  choices: readonly string[];
  /** index in `choices` */
  answer: number;
}

export interface QuizState {
  rngSeed: number;
  questions: readonly QuizQuestion[];
  current: number;
  score: number;
  streak: number;
  lastCorrect: boolean | null;
  lastAnswerIdx: number;
  startedAt: number;
  questionStarted: number;
  phase: "ask" | "feedback" | "done";
}

export interface QuizConfig {
  totalQuestions: number;
  pool: readonly QuizQuestion[];
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function quizInitial(seed: number, cfg: QuizConfig): QuizState {
  const rng = mulberry32(seed);
  const picked = shuffle(cfg.pool, rng).slice(0, cfg.totalQuestions);
  const now = 0; // deterministic
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    questions: picked,
    current: 0,
    score: 0,
    streak: 0,
    lastCorrect: null,
    lastAnswerIdx: -1,
    startedAt: now,
    questionStarted: now,
    phase: "ask",
  };
}

export function quizAnswer(
  state: QuizState,
  choiceIdx: number,
  elapsedMs: number,
): QuizState {
  if (state.phase !== "ask") return state;
  const q = state.questions[state.current];
  if (!q) return state;
  const correct = choiceIdx === q.answer;
  let pts = 0;
  if (correct) {
    const tBonus = Math.max(0, 5 - Math.floor(elapsedMs / 1000));
    const streakBonus = Math.min(5, state.streak);
    pts = 10 + tBonus + streakBonus;
  }
  return {
    ...state,
    score: state.score + pts,
    streak: correct ? state.streak + 1 : 0,
    lastCorrect: correct,
    lastAnswerIdx: choiceIdx,
    phase: "feedback",
  };
}

export function quizNext(state: QuizState, cfg: QuizConfig): QuizState {
  if (state.phase !== "feedback") return state;
  const next = state.current + 1;
  if (next >= cfg.totalQuestions) {
    return { ...state, current: next, phase: "done" };
  }
  return {
    ...state,
    current: next,
    lastCorrect: null,
    lastAnswerIdx: -1,
    questionStarted: 0,
    phase: "ask",
  };
}

export function quizScore(state: QuizState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
