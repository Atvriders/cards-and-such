import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const TeeKoQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Tee K.O. has players design?",
    "choices": [
      "T-shirts",
      "Posters",
      "Songs",
      "Dance moves"
    ],
    "answer": 0
  },
  {
    "q": "Designs combine?",
    "choices": [
      "Slogans + drawings",
      "Photos",
      "Music",
      "Voices"
    ],
    "answer": 0
  },
  {
    "q": "Tee K.O. is part of pack?",
    "choices": [
      "Pack 3",
      "Pack 1",
      "Pack 7",
      "Pack 9"
    ],
    "answer": 0
  },
  {
    "q": "Players vote on?",
    "choices": [
      "Best matchup",
      "Worst",
      "Fastest",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Tee K.O. winners can?",
    "choices": [
      "Order their shirt",
      "Win cash",
      "Win cards",
      "Skip"
    ],
    "answer": 0
  },
  {
    "q": "Tee K.O. is by?",
    "choices": [
      "Jackbox",
      "Hasbro",
      "Asmodee",
      "Mattel"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "3–8",
      "2",
      "12+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Released in?",
    "choices": [
      "2017",
      "2010",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Final round structure?",
    "choices": [
      "Tournament",
      "Round-robin",
      "Single",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Devices used?",
    "choices": [
      "TV + phones",
      "TV only",
      "Phones only",
      "Cards"
    ],
    "answer": 0
  },
  {
    "q": "Tee K.O. 2 adds?",
    "choices": [
      "More slogans",
      "Music",
      "Drawing",
      "Acting"
    ],
    "answer": 0
  },
  {
    "q": "How many shirts per player?",
    "choices": [
      "Three",
      "One",
      "Five",
      "Ten"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, TeeKoQuiz_QUESTIONS.length), pool: TeeKoQuiz_QUESTIONS };

export interface TeeKoQuizSettings { dummy: boolean; }
export type TeeKoQuizState = QuizState;
export type TeeKoQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: TeeKoQuizSettings): TeeKoQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: TeeKoQuizState, action: TeeKoQuizAction): TeeKoQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: TeeKoQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
