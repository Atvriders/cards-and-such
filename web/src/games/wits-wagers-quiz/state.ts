import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const WitsWagersQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Wits & Wagers asks?",
    "choices": [
      "Trivia with numeric answers",
      "Sketches",
      "Charades",
      "Words"
    ],
    "answer": 0
  },
  {
    "q": "Players bet on?",
    "choices": [
      "Whose answer is closest",
      "Their own",
      "No one's",
      "Time"
    ],
    "answer": 0
  },
  {
    "q": "Closest answer wins?",
    "choices": [
      "Pays per odds",
      "Set amount",
      "Nothing",
      "Half"
    ],
    "answer": 0
  },
  {
    "q": "Wits & Wagers is by?",
    "choices": [
      "North Star Games",
      "Jackbox",
      "Hasbro",
      "Asmodee"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "3–7",
      "2",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Wits & Wagers was released?",
    "choices": [
      "2005",
      "2015",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Designer is?",
    "choices": [
      "Dominic Crapuchettes",
      "Klaus Teuber",
      "Reiner Knizia",
      "Bruno Cathala"
    ],
    "answer": 0
  },
  {
    "q": "Highest payout multiplier?",
    "choices": [
      "5×",
      "2×",
      "10×",
      "20×"
    ],
    "answer": 0
  },
  {
    "q": "Default round count?",
    "choices": [
      "7",
      "10",
      "5",
      "12"
    ],
    "answer": 0
  },
  {
    "q": "Family edition is?",
    "choices": [
      "Wits & Wagers Family",
      "Wits Lite",
      "Wits Junior",
      "Wits XS"
    ],
    "answer": 0
  },
  {
    "q": "Closest answer that isn't over wins like in?",
    "choices": [
      "The Price is Right",
      "Jeopardy",
      "Wheel",
      "Bingo"
    ],
    "answer": 0
  },
  {
    "q": "Audience-friendly version is?",
    "choices": [
      "Wits Party",
      "Wits Pro",
      "Wits Solo",
      "Wits XL"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, WitsWagersQuiz_QUESTIONS.length), pool: WitsWagersQuiz_QUESTIONS };

export interface WitsWagersQuizSettings { dummy: boolean; }
export type WitsWagersQuizState = QuizState;
export type WitsWagersQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: WitsWagersQuizSettings): WitsWagersQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: WitsWagersQuizState, action: WitsWagersQuizAction): WitsWagersQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: WitsWagersQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
