import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const TwoTruthsLiePick_QUESTIONS: QuizQuestion[] = [
  {
    "q": "In Two Truths and a Lie, what is a \"Skip\" worth?",
    "choices": [
      "0",
      "1",
      "2",
      "5"
    ],
    "answer": 0
  },
  {
    "q": "Best Two Truths and a Lie cards generally?",
    "choices": [
      "Spark debate",
      "Boring",
      "Numbers",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Two Truths and a Lie optimal player count?",
    "choices": [
      "3+",
      "1",
      "Pets",
      "Robots"
    ],
    "answer": 0
  },
  {
    "q": "Two Truths and a Lie typically last?",
    "choices": [
      "10–30 min",
      "5 sec",
      "Hours",
      "Days"
    ],
    "answer": 0
  },
  {
    "q": "A great Two Truths and a Lie card asks?",
    "choices": [
      "Open opinions",
      "Yes/no",
      "Numbers",
      "Photos"
    ],
    "answer": 0
  },
  {
    "q": "Two Truths and a Lie pacing relies on?",
    "choices": [
      "Storytelling",
      "Counting",
      "Drawing",
      "Numbers"
    ],
    "answer": 0
  },
  {
    "q": "Two Truths and a Lie good with?",
    "choices": [
      "Friends/family",
      "Strangers",
      "Computers",
      "Pets"
    ],
    "answer": 0
  },
  {
    "q": "If everyone agrees in Two Truths and a Lie?",
    "choices": [
      "Less interesting",
      "More fun",
      "Same",
      "Won"
    ],
    "answer": 0
  },
  {
    "q": "Two Truths and a Lie category most popular?",
    "choices": [
      "Hypotheticals",
      "Math",
      "Trivia",
      "Sports"
    ],
    "answer": 0
  },
  {
    "q": "Two Truths and a Lie risk?",
    "choices": [
      "Awkward moments",
      "Boredom",
      "Cheating",
      "Loss"
    ],
    "answer": 0
  },
  {
    "q": "Best follow-up to a Two Truths and a Lie answer?",
    "choices": [
      "Why?",
      "No",
      "Skip",
      "Yes"
    ],
    "answer": 0
  },
  {
    "q": "Two Truths and a Lie ages well with?",
    "choices": [
      "New cards/themes",
      "Same cards",
      "Numbers",
      "None"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, TwoTruthsLiePick_QUESTIONS.length), pool: TwoTruthsLiePick_QUESTIONS };

export interface TwoTruthsLiePickSettings { dummy: boolean; }
export type TwoTruthsLiePickState = QuizState;
export type TwoTruthsLiePickAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: TwoTruthsLiePickSettings): TwoTruthsLiePickState {
  return quizInitial(seed, CFG);
}

export function reducer(state: TwoTruthsLiePickState, action: TwoTruthsLiePickAction): TwoTruthsLiePickState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: TwoTruthsLiePickState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
