import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const DixitQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Dixit cards feature?",
    "choices": [
      "Surreal artwork",
      "Photos",
      "Numbers",
      "Words"
    ],
    "answer": 0
  },
  {
    "q": "The active player is called?",
    "choices": [
      "The Storyteller",
      "The Caller",
      "The Drawer",
      "The Judge"
    ],
    "answer": 0
  },
  {
    "q": "Storyteller gives?",
    "choices": [
      "A clue or phrase",
      "A lie",
      "A number",
      "A score"
    ],
    "answer": 0
  },
  {
    "q": "Other players?",
    "choices": [
      "Submit matching cards",
      "Draw",
      "Vote first",
      "Sing"
    ],
    "answer": 0
  },
  {
    "q": "Players vote on?",
    "choices": [
      "Storyteller's card",
      "Best card",
      "Funniest",
      "Highest number"
    ],
    "answer": 0
  },
  {
    "q": "Dixit is by?",
    "choices": [
      "Libellud",
      "Jackbox",
      "Asmodee",
      "CMON"
    ],
    "answer": 0
  },
  {
    "q": "Dixit player count?",
    "choices": [
      "3–6",
      "2",
      "12+",
      "20"
    ],
    "answer": 0
  },
  {
    "q": "First Dixit released?",
    "choices": [
      "2008",
      "2015",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Score on board uses?",
    "choices": [
      "Bunnies",
      "Tokens",
      "Coins",
      "Dice"
    ],
    "answer": 0
  },
  {
    "q": "If all guess correctly, storyteller scores?",
    "choices": [
      "0",
      "6",
      "3",
      "10"
    ],
    "answer": 0
  },
  {
    "q": "If none guess correctly, storyteller scores?",
    "choices": [
      "0",
      "6",
      "3",
      "10"
    ],
    "answer": 0
  },
  {
    "q": "Dixit's designer is?",
    "choices": [
      "Jean-Louis Roubira",
      "Reiner Knizia",
      "Klaus Teuber",
      "Bruno Cathala"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, DixitQuiz_QUESTIONS.length), pool: DixitQuiz_QUESTIONS };

export interface DixitQuizSettings { dummy: boolean; }
export type DixitQuizState = QuizState;
export type DixitQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: DixitQuizSettings): DixitQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: DixitQuizState, action: DixitQuizAction): DixitQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: DixitQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
