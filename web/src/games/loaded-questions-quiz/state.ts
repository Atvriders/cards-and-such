import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const LoadedQuestionsQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Loaded Questions asks?",
    "choices": [
      "Personal opinion questions",
      "Numbers",
      "Lies",
      "Sketches"
    ],
    "answer": 0
  },
  {
    "q": "Players guess?",
    "choices": [
      "Who said what",
      "Highest number",
      "Truth",
      "Time"
    ],
    "answer": 0
  },
  {
    "q": "Loaded Questions is by?",
    "choices": [
      "All Things Equal",
      "Jackbox",
      "Hasbro",
      "Asmodee"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "3–6",
      "2",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Released in?",
    "choices": [
      "1997",
      "2005",
      "2015",
      "2020"
    ],
    "answer": 0
  },
  {
    "q": "Loaded Questions Go is for?",
    "choices": [
      "Phones/quick play",
      "Console",
      "TV",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Each round writes?",
    "choices": [
      "Personal answer",
      "Lies",
      "Numbers",
      "Sketches"
    ],
    "answer": 0
  },
  {
    "q": "Active player roles?",
    "choices": [
      "Judge guesses authors",
      "Speaker",
      "Drawer",
      "Singer"
    ],
    "answer": 0
  },
  {
    "q": "Categories include?",
    "choices": [
      "Family-friendly",
      "Numeric",
      "Sketches",
      "Songs"
    ],
    "answer": 0
  },
  {
    "q": "Questions per game?",
    "choices": [
      "Many",
      "One",
      "Five",
      "Ten"
    ],
    "answer": 0
  },
  {
    "q": "Win condition?",
    "choices": [
      "First to space on board",
      "Most lies",
      "Best art",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Loaded Questions Junior is for?",
    "choices": [
      "Kids",
      "Adults",
      "Pets",
      "Babies"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, LoadedQuestionsQuiz_QUESTIONS.length), pool: LoadedQuestionsQuiz_QUESTIONS };

export interface LoadedQuestionsQuizSettings { dummy: boolean; }
export type LoadedQuestionsQuizState = QuizState;
export type LoadedQuestionsQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: LoadedQuestionsQuizSettings): LoadedQuestionsQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: LoadedQuestionsQuizState, action: LoadedQuestionsQuizAction): LoadedQuestionsQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: LoadedQuestionsQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
