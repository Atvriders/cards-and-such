import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const TruthOrDarePick_QUESTIONS: QuizQuestion[] = [
  {
    "q": "In Truth or Dare, what is a \"Skip\" worth?",
    "choices": [
      "0",
      "1",
      "2",
      "5"
    ],
    "answer": 0
  },
  {
    "q": "Best Truth or Dare cards generally?",
    "choices": [
      "Spark debate",
      "Boring",
      "Numbers",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Truth or Dare optimal player count?",
    "choices": [
      "3+",
      "1",
      "Pets",
      "Robots"
    ],
    "answer": 0
  },
  {
    "q": "Truth or Dare typically last?",
    "choices": [
      "10–30 min",
      "5 sec",
      "Hours",
      "Days"
    ],
    "answer": 0
  },
  {
    "q": "A great Truth or Dare card asks?",
    "choices": [
      "Open opinions",
      "Yes/no",
      "Numbers",
      "Photos"
    ],
    "answer": 0
  },
  {
    "q": "Truth or Dare pacing relies on?",
    "choices": [
      "Storytelling",
      "Counting",
      "Drawing",
      "Numbers"
    ],
    "answer": 0
  },
  {
    "q": "Truth or Dare good with?",
    "choices": [
      "Friends/family",
      "Strangers",
      "Computers",
      "Pets"
    ],
    "answer": 0
  },
  {
    "q": "If everyone agrees in Truth or Dare?",
    "choices": [
      "Less interesting",
      "More fun",
      "Same",
      "Won"
    ],
    "answer": 0
  },
  {
    "q": "Truth or Dare category most popular?",
    "choices": [
      "Hypotheticals",
      "Math",
      "Trivia",
      "Sports"
    ],
    "answer": 0
  },
  {
    "q": "Truth or Dare risk?",
    "choices": [
      "Awkward moments",
      "Boredom",
      "Cheating",
      "Loss"
    ],
    "answer": 0
  },
  {
    "q": "Best follow-up to a Truth or Dare answer?",
    "choices": [
      "Why?",
      "No",
      "Skip",
      "Yes"
    ],
    "answer": 0
  },
  {
    "q": "Truth or Dare ages well with?",
    "choices": [
      "New cards/themes",
      "Same cards",
      "Numbers",
      "None"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, TruthOrDarePick_QUESTIONS.length), pool: TruthOrDarePick_QUESTIONS };

export interface TruthOrDarePickSettings { dummy: boolean; }
export type TruthOrDarePickState = QuizState;
export type TruthOrDarePickAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: TruthOrDarePickSettings): TruthOrDarePickState {
  return quizInitial(seed, CFG);
}

export function reducer(state: TruthOrDarePickState, action: TruthOrDarePickAction): TruthOrDarePickState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: TruthOrDarePickState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
