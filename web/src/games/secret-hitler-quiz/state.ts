import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const SecretHitlerQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Secret Hitler has roles?",
    "choices": [
      "Liberals & Fascists",
      "Cops & Robbers",
      "Mages",
      "Pirates"
    ],
    "answer": 0
  },
  {
    "q": "Players elect?",
    "choices": [
      "President & Chancellor",
      "Captain",
      "Mayor",
      "Judge"
    ],
    "answer": 0
  },
  {
    "q": "Liberal goal?",
    "choices": [
      "Pass 5 liberal policies",
      "Eat",
      "Sing",
      "Build"
    ],
    "answer": 0
  },
  {
    "q": "Fascist goal?",
    "choices": [
      "Pass 6 fascist or elect Hitler",
      "Win random",
      "Vote out",
      "Lie"
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
      "2016",
      "2005",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Secret Hitler is by?",
    "choices": [
      "Goat, Wolf, & Cabbage",
      "Jackbox",
      "Hasbro",
      "Asmodee"
    ],
    "answer": 0
  },
  {
    "q": "Hitler is technically?",
    "choices": [
      "A fascist",
      "A liberal",
      "A spy",
      "Neutral"
    ],
    "answer": 0
  },
  {
    "q": "Election rejection cap?",
    "choices": [
      "3 in a row",
      "No limit",
      "5",
      "2"
    ],
    "answer": 0
  },
  {
    "q": "Policies are drawn by?",
    "choices": [
      "President",
      "Chancellor",
      "Both",
      "Audience"
    ],
    "answer": 0
  },
  {
    "q": "Power: Investigate Loyalty?",
    "choices": [
      "See another's role",
      "Heal",
      "Skip",
      "Lie"
    ],
    "answer": 0
  },
  {
    "q": "Win for fascists if Hitler?",
    "choices": [
      "Elected after 3 fascist policies",
      "Always",
      "Never",
      "Random"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, SecretHitlerQuiz_QUESTIONS.length), pool: SecretHitlerQuiz_QUESTIONS };

export interface SecretHitlerQuizSettings { dummy: boolean; }
export type SecretHitlerQuizState = QuizState;
export type SecretHitlerQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: SecretHitlerQuizSettings): SecretHitlerQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: SecretHitlerQuizState, action: SecretHitlerQuizAction): SecretHitlerQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: SecretHitlerQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
