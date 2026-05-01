import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const NeverHaveIEverPick_QUESTIONS: QuizQuestion[] = [
  {
    "q": "In Never Have I Ever, what is a \"Skip\" worth?",
    "choices": [
      "0",
      "1",
      "2",
      "5"
    ],
    "answer": 0
  },
  {
    "q": "Best Never Have I Ever cards generally?",
    "choices": [
      "Spark debate",
      "Boring",
      "Numbers",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Never Have I Ever optimal player count?",
    "choices": [
      "3+",
      "1",
      "Pets",
      "Robots"
    ],
    "answer": 0
  },
  {
    "q": "Never Have I Ever typically last?",
    "choices": [
      "10–30 min",
      "5 sec",
      "Hours",
      "Days"
    ],
    "answer": 0
  },
  {
    "q": "A great Never Have I Ever card asks?",
    "choices": [
      "Open opinions",
      "Yes/no",
      "Numbers",
      "Photos"
    ],
    "answer": 0
  },
  {
    "q": "Never Have I Ever pacing relies on?",
    "choices": [
      "Storytelling",
      "Counting",
      "Drawing",
      "Numbers"
    ],
    "answer": 0
  },
  {
    "q": "Never Have I Ever good with?",
    "choices": [
      "Friends/family",
      "Strangers",
      "Computers",
      "Pets"
    ],
    "answer": 0
  },
  {
    "q": "If everyone agrees in Never Have I Ever?",
    "choices": [
      "Less interesting",
      "More fun",
      "Same",
      "Won"
    ],
    "answer": 0
  },
  {
    "q": "Never Have I Ever category most popular?",
    "choices": [
      "Hypotheticals",
      "Math",
      "Trivia",
      "Sports"
    ],
    "answer": 0
  },
  {
    "q": "Never Have I Ever risk?",
    "choices": [
      "Awkward moments",
      "Boredom",
      "Cheating",
      "Loss"
    ],
    "answer": 0
  },
  {
    "q": "Best follow-up to a Never Have I Ever answer?",
    "choices": [
      "Why?",
      "No",
      "Skip",
      "Yes"
    ],
    "answer": 0
  },
  {
    "q": "Never Have I Ever ages well with?",
    "choices": [
      "New cards/themes",
      "Same cards",
      "Numbers",
      "None"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, NeverHaveIEverPick_QUESTIONS.length), pool: NeverHaveIEverPick_QUESTIONS };

export interface NeverHaveIEverPickSettings { dummy: boolean; }
export type NeverHaveIEverPickState = QuizState;
export type NeverHaveIEverPickAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: NeverHaveIEverPickSettings): NeverHaveIEverPickState {
  return quizInitial(seed, CFG);
}

export function reducer(state: NeverHaveIEverPickState, action: NeverHaveIEverPickAction): NeverHaveIEverPickState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: NeverHaveIEverPickState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
