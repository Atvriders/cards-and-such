import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const WouldYouRatherPick_QUESTIONS: QuizQuestion[] = [
  {
    "q": "In Would You Rather, what is a \"Skip\" worth?",
    "choices": [
      "0",
      "1",
      "2",
      "5"
    ],
    "answer": 0
  },
  {
    "q": "Best Would You Rather cards generally?",
    "choices": [
      "Spark debate",
      "Boring",
      "Numbers",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Would You Rather optimal player count?",
    "choices": [
      "3+",
      "1",
      "Pets",
      "Robots"
    ],
    "answer": 0
  },
  {
    "q": "Would You Rather typically last?",
    "choices": [
      "10–30 min",
      "5 sec",
      "Hours",
      "Days"
    ],
    "answer": 0
  },
  {
    "q": "A great Would You Rather card asks?",
    "choices": [
      "Open opinions",
      "Yes/no",
      "Numbers",
      "Photos"
    ],
    "answer": 0
  },
  {
    "q": "Would You Rather pacing relies on?",
    "choices": [
      "Storytelling",
      "Counting",
      "Drawing",
      "Numbers"
    ],
    "answer": 0
  },
  {
    "q": "Would You Rather good with?",
    "choices": [
      "Friends/family",
      "Strangers",
      "Computers",
      "Pets"
    ],
    "answer": 0
  },
  {
    "q": "If everyone agrees in Would You Rather?",
    "choices": [
      "Less interesting",
      "More fun",
      "Same",
      "Won"
    ],
    "answer": 0
  },
  {
    "q": "Would You Rather category most popular?",
    "choices": [
      "Hypotheticals",
      "Math",
      "Trivia",
      "Sports"
    ],
    "answer": 0
  },
  {
    "q": "Would You Rather risk?",
    "choices": [
      "Awkward moments",
      "Boredom",
      "Cheating",
      "Loss"
    ],
    "answer": 0
  },
  {
    "q": "Best follow-up to a Would You Rather answer?",
    "choices": [
      "Why?",
      "No",
      "Skip",
      "Yes"
    ],
    "answer": 0
  },
  {
    "q": "Would You Rather ages well with?",
    "choices": [
      "New cards/themes",
      "Same cards",
      "Numbers",
      "None"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, WouldYouRatherPick_QUESTIONS.length), pool: WouldYouRatherPick_QUESTIONS };

export interface WouldYouRatherPickSettings { dummy: boolean; }
export type WouldYouRatherPickState = QuizState;
export type WouldYouRatherPickAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: WouldYouRatherPickSettings): WouldYouRatherPickState {
  return quizInitial(seed, CFG);
}

export function reducer(state: WouldYouRatherPickState, action: WouldYouRatherPickAction): WouldYouRatherPickState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: WouldYouRatherPickState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
