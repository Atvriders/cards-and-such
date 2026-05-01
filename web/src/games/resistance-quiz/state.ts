import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const ResistanceQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Resistance: rebels vs?",
    "choices": [
      "Spies",
      "Cops",
      "Mages",
      "Pirates"
    ],
    "answer": 0
  },
  {
    "q": "Players vote on?",
    "choices": [
      "Mission team",
      "Words",
      "Roll",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Rebels win after?",
    "choices": [
      "3 successful missions",
      "All",
      "Vote",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Spies win after?",
    "choices": [
      "3 failed missions",
      "All",
      "Vote",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "5–10",
      "2",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Released in?",
    "choices": [
      "2009",
      "2005",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Resistance is by?",
    "choices": [
      "Indie Boards & Cards",
      "Jackbox",
      "Hasbro",
      "Asmodee"
    ],
    "answer": 0
  },
  {
    "q": "Compared to Avalon?",
    "choices": [
      "No special roles",
      "Same roles",
      "More roles",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Mission cards are?",
    "choices": [
      "Success/Fail",
      "Vote",
      "Color",
      "Number"
    ],
    "answer": 0
  },
  {
    "q": "Mission requires?",
    "choices": [
      "Specific number of fails",
      "Vote",
      "Random",
      "Time"
    ],
    "answer": 0
  },
  {
    "q": "Avalon adds?",
    "choices": [
      "Roles",
      "Music",
      "Dice",
      "Cards"
    ],
    "answer": 0
  },
  {
    "q": "Game ends after?",
    "choices": [
      "3-3 or 5 missions",
      "All vote",
      "Time",
      "Random"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, ResistanceQuiz_QUESTIONS.length), pool: ResistanceQuiz_QUESTIONS };

export interface ResistanceQuizSettings { dummy: boolean; }
export type ResistanceQuizState = QuizState;
export type ResistanceQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: ResistanceQuizSettings): ResistanceQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: ResistanceQuizState, action: ResistanceQuizAction): ResistanceQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: ResistanceQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
