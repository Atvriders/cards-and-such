import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const MonikersQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Monikers descends from?",
    "choices": [
      "Celebrities (Salad Bowl)",
      "Pictionary",
      "Charades",
      "Telestrations"
    ],
    "answer": 0
  },
  {
    "q": "Monikers has how many rounds?",
    "choices": [
      "3",
      "2",
      "5",
      "1"
    ],
    "answer": 0
  },
  {
    "q": "Round 1 allows?",
    "choices": [
      "Anything but the name",
      "Single word",
      "One word",
      "Charades"
    ],
    "answer": 0
  },
  {
    "q": "Round 2 allows?",
    "choices": [
      "One word",
      "Charades",
      "Sounds",
      "Anything"
    ],
    "answer": 0
  },
  {
    "q": "Round 3 allows?",
    "choices": [
      "Charades only",
      "One word",
      "Sounds",
      "Free"
    ],
    "answer": 0
  },
  {
    "q": "Monikers is by?",
    "choices": [
      "Palm Court",
      "Jackbox",
      "Hasbro",
      "Asmodee"
    ],
    "answer": 0
  },
  {
    "q": "Year released?",
    "choices": [
      "2015",
      "2005",
      "2020",
      "1995"
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
    "q": "Game uses cards with?",
    "choices": [
      "Names + descriptions",
      "Numbers",
      "Photos",
      "Words only"
    ],
    "answer": 0
  },
  {
    "q": "Cards repeat?",
    "choices": [
      "Across all 3 rounds",
      "No",
      "Random",
      "Once each"
    ],
    "answer": 0
  },
  {
    "q": "Monikers Serious is?",
    "choices": [
      "Serious-themed deck",
      "Funny",
      "Kids",
      "Adults only"
    ],
    "answer": 0
  },
  {
    "q": "Best for parties because?",
    "choices": [
      "Fast and social",
      "Slow strategy",
      "Solo",
      "Long"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, MonikersQuiz_QUESTIONS.length), pool: MonikersQuiz_QUESTIONS };

export interface MonikersQuizSettings { dummy: boolean; }
export type MonikersQuizState = QuizState;
export type MonikersQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: MonikersQuizSettings): MonikersQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: MonikersQuizState, action: MonikersQuizAction): MonikersQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: MonikersQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
