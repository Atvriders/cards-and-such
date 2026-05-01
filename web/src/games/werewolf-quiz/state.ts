import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const WerewolfQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Werewolf has?",
    "choices": [
      "Hidden roles",
      "Open hands",
      "Numbers",
      "Cards face-up"
    ],
    "answer": 0
  },
  {
    "q": "Villagers want to?",
    "choices": [
      "Kill werewolves",
      "Lie",
      "Hide",
      "Sing"
    ],
    "answer": 0
  },
  {
    "q": "Werewolves want to?",
    "choices": [
      "Eat villagers",
      "Eat each other",
      "Win silently",
      "Vote out"
    ],
    "answer": 0
  },
  {
    "q": "Rounds alternate?",
    "choices": [
      "Day & Night",
      "Spring & Fall",
      "Hot & Cold",
      "Active & Rest"
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
    "q": "Werewolf is also called?",
    "choices": [
      "Mafia",
      "Coup",
      "Avalon",
      "Skull"
    ],
    "answer": 0
  },
  {
    "q": "Released in?",
    "choices": [
      "1986",
      "2005",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Day phase ends with?",
    "choices": [
      "Lynch vote",
      "Random kill",
      "No vote",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Night phase werewolves?",
    "choices": [
      "Choose victim",
      "Sleep",
      "Vote",
      "Sing"
    ],
    "answer": 0
  },
  {
    "q": "Special role: Seer?",
    "choices": [
      "Sees alignment",
      "Has extra vote",
      "Heals",
      "Lies"
    ],
    "answer": 0
  },
  {
    "q": "Special role: Doctor?",
    "choices": [
      "Saves a player",
      "Heals two",
      "Kills",
      "Lies"
    ],
    "answer": 0
  },
  {
    "q": "Game ends when?",
    "choices": [
      "One side eliminated",
      "All vote",
      "Time",
      "Cards out"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, WerewolfQuiz_QUESTIONS.length), pool: WerewolfQuiz_QUESTIONS };

export interface WerewolfQuizSettings { dummy: boolean; }
export type WerewolfQuizState = QuizState;
export type WerewolfQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: WerewolfQuizSettings): WerewolfQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: WerewolfQuizState, action: WerewolfQuizAction): WerewolfQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: WerewolfQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
