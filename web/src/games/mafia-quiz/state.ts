import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const MafiaQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Mafia is also called?",
    "choices": [
      "Werewolf",
      "Coup",
      "Avalon",
      "Skull"
    ],
    "answer": 0
  },
  {
    "q": "Mafia knows?",
    "choices": [
      "Each other",
      "Nothing",
      "All",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Town wins by?",
    "choices": [
      "Eliminating mafia",
      "Lying",
      "Voting all",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Mafia wins by?",
    "choices": [
      "Outnumbering town",
      "Voting",
      "Lying",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Special role: Detective?",
    "choices": [
      "Investigates",
      "Heals",
      "Kills",
      "Lies"
    ],
    "answer": 0
  },
  {
    "q": "Special role: Doctor?",
    "choices": [
      "Heals",
      "Kills",
      "Lies",
      "Investigates"
    ],
    "answer": 0
  },
  {
    "q": "Created by?",
    "choices": [
      "Dimitry Davidoff",
      "Reiner Knizia",
      "Klaus Teuber",
      "Bruno Cathala"
    ],
    "answer": 0
  },
  {
    "q": "Year created?",
    "choices": [
      "1986",
      "2005",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "7+",
      "2",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Phases?",
    "choices": [
      "Day & Night",
      "Hot & Cold",
      "Spring & Fall",
      "Active & Rest"
    ],
    "answer": 0
  },
  {
    "q": "Day phase ends with?",
    "choices": [
      "Lynch",
      "Random",
      "Skip",
      "Time"
    ],
    "answer": 0
  },
  {
    "q": "Night phase mafia?",
    "choices": [
      "Choose victim",
      "Sleep",
      "Vote",
      "Sing"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, MafiaQuiz_QUESTIONS.length), pool: MafiaQuiz_QUESTIONS };

export interface MafiaQuizSettings { dummy: boolean; }
export type MafiaQuizState = QuizState;
export type MafiaQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: MafiaQuizSettings): MafiaQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: MafiaQuizState, action: MafiaQuizAction): MafiaQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: MafiaQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
