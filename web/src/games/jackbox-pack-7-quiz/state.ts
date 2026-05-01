import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const JackboxPack7Quiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Jackbox Pack 1 includes?",
    "choices": [
      "You Don't Know Jack 2015",
      "Drawful 2",
      "Tee K.O.",
      "Quiplash 2"
    ],
    "answer": 0
  },
  {
    "q": "Jackbox Pack 7 features?",
    "choices": [
      "Quiplash 3",
      "Drawful 2",
      "Trivia Murder Party",
      "Bracketeering"
    ],
    "answer": 0
  },
  {
    "q": "Jackbox developer?",
    "choices": [
      "Jackbox Games",
      "Jellyvision",
      "Telltale",
      "Asmodee"
    ],
    "answer": 0
  },
  {
    "q": "All Jackbox games join via?",
    "choices": [
      "Jackbox.tv",
      "Steam only",
      "Cartridge",
      "Disc"
    ],
    "answer": 0
  },
  {
    "q": "Player count typical?",
    "choices": [
      "1–8 (some up to 10)",
      "2 only",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Audience feature size?",
    "choices": [
      "Up to 10000",
      "Up to 8",
      "Up to 100",
      "None"
    ],
    "answer": 0
  },
  {
    "q": "Pack 7 contains how many games?",
    "choices": [
      "5",
      "3",
      "8",
      "12"
    ],
    "answer": 0
  },
  {
    "q": "Pack 1 contains how many games?",
    "choices": [
      "5",
      "3",
      "8",
      "12"
    ],
    "answer": 0
  },
  {
    "q": "First Jackbox Party Pack released?",
    "choices": [
      "2014",
      "2010",
      "2018",
      "2005"
    ],
    "answer": 0
  },
  {
    "q": "Jackbox 7 standout title?",
    "choices": [
      "Quiplash 3",
      "Drawful",
      "Tee K.O.",
      "Trivia Death"
    ],
    "answer": 0
  },
  {
    "q": "Jackbox games typically end with?",
    "choices": [
      "Final round multiplier",
      "Sudden death",
      "Coinflip",
      "Vote"
    ],
    "answer": 0
  },
  {
    "q": "Recommended setup?",
    "choices": [
      "TV + phones",
      "Phones only",
      "Tabletop",
      "Console"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, JackboxPack7Quiz_QUESTIONS.length), pool: JackboxPack7Quiz_QUESTIONS };

export interface JackboxPack7QuizSettings { dummy: boolean; }
export type JackboxPack7QuizState = QuizState;
export type JackboxPack7QuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: JackboxPack7QuizSettings): JackboxPack7QuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: JackboxPack7QuizState, action: JackboxPack7QuizAction): JackboxPack7QuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: JackboxPack7QuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
