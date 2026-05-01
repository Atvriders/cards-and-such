import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const ApplesToApplesQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Apples to Apples uses?",
    "choices": [
      "Red & green cards",
      "Dice",
      "Spinner",
      "Pawns"
    ],
    "answer": 0
  },
  {
    "q": "Judge picks?",
    "choices": [
      "Most fitting card",
      "Highest",
      "Random",
      "Smallest"
    ],
    "answer": 0
  },
  {
    "q": "Red cards are?",
    "choices": [
      "Nouns",
      "Adjectives",
      "Numbers",
      "Pictures"
    ],
    "answer": 0
  },
  {
    "q": "Green cards are?",
    "choices": [
      "Adjectives",
      "Nouns",
      "Verbs",
      "Numbers"
    ],
    "answer": 0
  },
  {
    "q": "Apples to Apples is by?",
    "choices": [
      "Mattel",
      "Hasbro",
      "Out of the Box",
      "Asmodee"
    ],
    "answer": 2
  },
  {
    "q": "Player count?",
    "choices": [
      "4–10",
      "2",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Released in?",
    "choices": [
      "1999",
      "2005",
      "2015",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Card to win is?",
    "choices": [
      "Green",
      "Red",
      "Black",
      "Blue"
    ],
    "answer": 0
  },
  {
    "q": "Game ends when?",
    "choices": [
      "Player gets enough green cards",
      "Time",
      "Cards run out",
      "Vote"
    ],
    "answer": 0
  },
  {
    "q": "Apples to Apples Junior is for?",
    "choices": [
      "Kids",
      "Adults only",
      "Pets",
      "Babies"
    ],
    "answer": 0
  },
  {
    "q": "Big Picture variant uses?",
    "choices": [
      "Pictures",
      "Dice",
      "Words only",
      "Sounds"
    ],
    "answer": 0
  },
  {
    "q": "Cards Against Humanity is inspired by?",
    "choices": [
      "Apples to Apples",
      "Pictionary",
      "Charades",
      "Hanabi"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, ApplesToApplesQuiz_QUESTIONS.length), pool: ApplesToApplesQuiz_QUESTIONS };

export interface ApplesToApplesQuizSettings { dummy: boolean; }
export type ApplesToApplesQuizState = QuizState;
export type ApplesToApplesQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: ApplesToApplesQuizSettings): ApplesToApplesQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: ApplesToApplesQuizState, action: ApplesToApplesQuizAction): ApplesToApplesQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: ApplesToApplesQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
