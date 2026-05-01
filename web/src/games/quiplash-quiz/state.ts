import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const QuiplashQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Quiplash gives you?",
    "choices": [
      "Two open-ended prompts",
      "Multiple choice",
      "Numbers",
      "Charades"
    ],
    "answer": 0
  },
  {
    "q": "Players vote on?",
    "choices": [
      "Funniest answer",
      "Best handwriting",
      "Worst answer",
      "Speed"
    ],
    "answer": 0
  },
  {
    "q": "Quiplash is by?",
    "choices": [
      "Jackbox",
      "USAopoly",
      "Asmodee",
      "CMON"
    ],
    "answer": 0
  },
  {
    "q": "Quiplash player count?",
    "choices": [
      "3–8",
      "2",
      "20+",
      "1"
    ],
    "answer": 0
  },
  {
    "q": "Quiplash audience members are called?",
    "choices": [
      "Hecklers",
      "The Audience",
      "Judges",
      "Refs"
    ],
    "answer": 1
  },
  {
    "q": "Final round is called?",
    "choices": [
      "Quiplash 3",
      "Last Lash",
      "Final Q",
      "Big Lie"
    ],
    "answer": 1
  },
  {
    "q": "Last Lash awards?",
    "choices": [
      "Triple points",
      "2× points",
      "Half",
      "Same"
    ],
    "answer": 1
  },
  {
    "q": "Quiplash 2 added?",
    "choices": [
      "Custom episodes",
      "Drawing",
      "Music",
      "Boards"
    ],
    "answer": 0
  },
  {
    "q": "Quiplash was released in?",
    "choices": [
      "2015",
      "2010",
      "2020",
      "2005"
    ],
    "answer": 0
  },
  {
    "q": "Quiplash needs how many devices?",
    "choices": [
      "TV + phones",
      "Just TV",
      "Just phones",
      "Dice"
    ],
    "answer": 0
  },
  {
    "q": "XL pack increased question count to?",
    "choices": [
      "1000+",
      "100",
      "50",
      "10"
    ],
    "answer": 0
  },
  {
    "q": "Quiplash 3 is part of pack?",
    "choices": [
      "Pack 7",
      "Pack 1",
      "Pack 2",
      "Pack 9"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, QuiplashQuiz_QUESTIONS.length), pool: QuiplashQuiz_QUESTIONS };

export interface QuiplashQuizSettings { dummy: boolean; }
export type QuiplashQuizState = QuizState;
export type QuiplashQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: QuiplashQuizSettings): QuiplashQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: QuiplashQuizState, action: QuiplashQuizAction): QuiplashQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: QuiplashQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
