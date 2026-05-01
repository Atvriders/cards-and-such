import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const FibbageQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Fibbage was made by which studio?",
    "choices": [
      "Telltale",
      "Jackbox",
      "Hasbro",
      "Asmodee"
    ],
    "answer": 1
  },
  {
    "q": "In Fibbage you write?",
    "choices": [
      "A truth",
      "A convincing lie",
      "A poem",
      "A sketch"
    ],
    "answer": 1
  },
  {
    "q": "Players score by?",
    "choices": [
      "Tricking others",
      "Drawing well",
      "Singing",
      "Acting"
    ],
    "answer": 0
  },
  {
    "q": "Fibbage is part of which Jackbox pack?",
    "choices": [
      "Pack 1",
      "Pack 2",
      "Pack 7",
      "Pack 9"
    ],
    "answer": 0
  },
  {
    "q": "Players join the game via?",
    "choices": [
      "Buying cards",
      "Phones at jackbox.tv",
      "Game controllers",
      "Dice"
    ],
    "answer": 1
  },
  {
    "q": "Recommended player count?",
    "choices": [
      "1",
      "2–8",
      "12+",
      "20"
    ],
    "answer": 1
  },
  {
    "q": "Fibbage was first released in?",
    "choices": [
      "2014",
      "2010",
      "2018",
      "2022"
    ],
    "answer": 0
  },
  {
    "q": "A Lie Detector lets you?",
    "choices": [
      "Win automatically",
      "Eliminate one wrong answer",
      "Skip a round",
      "Steal points"
    ],
    "answer": 1
  },
  {
    "q": "If everyone picks the truth, points are?",
    "choices": [
      "Triple",
      "Doubled",
      "None",
      "Halved"
    ],
    "answer": 1
  },
  {
    "q": "Game ends after?",
    "choices": [
      "10 rounds",
      "Three rounds",
      "Time only",
      "One round"
    ],
    "answer": 1
  },
  {
    "q": "Fibbage 2 added?",
    "choices": [
      "Lie likes",
      "Final round mechanic",
      "No new features",
      "Music battles"
    ],
    "answer": 1
  },
  {
    "q": "Fibbage XL features?",
    "choices": [
      "More questions",
      "Drawing",
      "Acting",
      "Dice"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, FibbageQuiz_QUESTIONS.length), pool: FibbageQuiz_QUESTIONS };

export interface FibbageQuizSettings { dummy: boolean; }
export type FibbageQuizState = QuizState;
export type FibbageQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: FibbageQuizSettings): FibbageQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: FibbageQuizState, action: FibbageQuizAction): FibbageQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: FibbageQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
