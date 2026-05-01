import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const PictionaryManQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Pictionary players?",
    "choices": [
      "Draw and guess",
      "Act",
      "Sing",
      "Hum"
    ],
    "answer": 0
  },
  {
    "q": "Pictionary is by?",
    "choices": [
      "Mattel",
      "Hasbro",
      "CMON",
      "Asmodee"
    ],
    "answer": 0
  },
  {
    "q": "Released in?",
    "choices": [
      "1985",
      "1995",
      "2005",
      "1975"
    ],
    "answer": 0
  },
  {
    "q": "Game uses a?",
    "choices": [
      "Sand timer",
      "Phone app",
      "Dice tower",
      "Spinner only"
    ],
    "answer": 0
  },
  {
    "q": "Categories include?",
    "choices": [
      "Action, person, object, etc.",
      "Just animals",
      "Just food",
      "Numbers"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "3–16",
      "2",
      "Solo",
      "100"
    ],
    "answer": 0
  },
  {
    "q": "Pictionary Mania adds?",
    "choices": [
      "Twists",
      "Cards",
      "Dice",
      "Music"
    ],
    "answer": 0
  },
  {
    "q": "Pictionary Card Game uses?",
    "choices": [
      "Cards instead of board",
      "Board only",
      "No drawing",
      "Dice"
    ],
    "answer": 0
  },
  {
    "q": "Pictionary Man features?",
    "choices": [
      "Doodler",
      "Robot",
      "Audio",
      "Spinner"
    ],
    "answer": 0
  },
  {
    "q": "Designer is?",
    "choices": [
      "Robert Angel",
      "Klaus Teuber",
      "Reiner Knizia",
      "Bruno Cathala"
    ],
    "answer": 0
  },
  {
    "q": "Pictionary uses how many dice?",
    "choices": [
      "1",
      "0",
      "3",
      "6"
    ],
    "answer": 0
  },
  {
    "q": "Default round time is?",
    "choices": [
      "1 minute",
      "30 seconds",
      "2 minutes",
      "5 minutes"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, PictionaryManQuiz_QUESTIONS.length), pool: PictionaryManQuiz_QUESTIONS };

export interface PictionaryManQuizSettings { dummy: boolean; }
export type PictionaryManQuizState = QuizState;
export type PictionaryManQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: PictionaryManQuizSettings): PictionaryManQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: PictionaryManQuizState, action: PictionaryManQuizAction): PictionaryManQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: PictionaryManQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
