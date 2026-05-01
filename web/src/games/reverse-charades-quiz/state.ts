import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const ReverseCharadesQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Charades is mostly?",
    "choices": [
      "Acting silently",
      "Drawing",
      "Singing",
      "Roll dice"
    ],
    "answer": 0
  },
  {
    "q": "Charades originated as?",
    "choices": [
      "Riddle game",
      "Card game",
      "Dice",
      "Computer"
    ],
    "answer": 0
  },
  {
    "q": "Categories include?",
    "choices": [
      "Movies, books, songs",
      "Numbers",
      "Colors",
      "Foods only"
    ],
    "answer": 0
  },
  {
    "q": "Reverse Charades has?",
    "choices": [
      "Group acts to one guesser",
      "Solo act",
      "Vote",
      "Sing"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "4+",
      "2",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Charades typically uses?",
    "choices": [
      "Timer",
      "Dice",
      "Spinner",
      "Cards only"
    ],
    "answer": 0
  },
  {
    "q": "Common gesture: book?",
    "choices": [
      "Open hands",
      "Cup ear",
      "Tap arm",
      "Crank"
    ],
    "answer": 0
  },
  {
    "q": "Common gesture: movie?",
    "choices": [
      "Crank old camera",
      "Open book",
      "Tap arm",
      "Cup ear"
    ],
    "answer": 0
  },
  {
    "q": "Common gesture: TV?",
    "choices": [
      "Box with hands",
      "Open hands",
      "Cup ear",
      "Crank"
    ],
    "answer": 0
  },
  {
    "q": "Common gesture: song?",
    "choices": [
      "Open mouth, music notes",
      "Crank",
      "Open book",
      "Tap"
    ],
    "answer": 0
  },
  {
    "q": "Sounds-like gesture?",
    "choices": [
      "Tug ear",
      "Crank",
      "Open book",
      "Tap"
    ],
    "answer": 0
  },
  {
    "q": "Categories on cards include?",
    "choices": [
      "People, places, things",
      "Numbers",
      "Music notes",
      "Food"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, ReverseCharadesQuiz_QUESTIONS.length), pool: ReverseCharadesQuiz_QUESTIONS };

export interface ReverseCharadesQuizSettings { dummy: boolean; }
export type ReverseCharadesQuizState = QuizState;
export type ReverseCharadesQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: ReverseCharadesQuizSettings): ReverseCharadesQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: ReverseCharadesQuizState, action: ReverseCharadesQuizAction): ReverseCharadesQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: ReverseCharadesQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
