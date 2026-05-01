import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const SpyfallTimeTravel_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Spyfall: one player is?",
    "choices": [
      "The Spy",
      "The Detective",
      "The Boss",
      "The Mafia"
    ],
    "answer": 0
  },
  {
    "q": "Other players know?",
    "choices": [
      "A location",
      "Spy's identity",
      "Random word",
      "Numbers"
    ],
    "answer": 0
  },
  {
    "q": "Players try to?",
    "choices": [
      "Find spy",
      "Avoid",
      "Lie",
      "Sing"
    ],
    "answer": 0
  },
  {
    "q": "Spy tries to?",
    "choices": [
      "Identify location",
      "Lie loudly",
      "Win silent",
      "Eat"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "3–8",
      "2",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "Released in?",
    "choices": [
      "2014",
      "2010",
      "2020",
      "2005"
    ],
    "answer": 0
  },
  {
    "q": "Spyfall is by?",
    "choices": [
      "Hobby World",
      "Jackbox",
      "Asmodee",
      "Mattel"
    ],
    "answer": 0
  },
  {
    "q": "Spyfall 2 adds?",
    "choices": [
      "Two spies, more locations",
      "Cards",
      "Numbers",
      "None"
    ],
    "answer": 0
  },
  {
    "q": "Time Travel variant uses?",
    "choices": [
      "Eras",
      "Music",
      "Songs",
      "Numbers"
    ],
    "answer": 0
  },
  {
    "q": "Round length?",
    "choices": [
      "8 minutes",
      "2 mins",
      "20 mins",
      "Open-ended"
    ],
    "answer": 0
  },
  {
    "q": "Win condition for non-spies?",
    "choices": [
      "Find the spy",
      "Find location",
      "Vote",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Win condition for spy?",
    "choices": [
      "Guess location or run out clock",
      "Lie best",
      "Speak last",
      "Be voted"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, SpyfallTimeTravel_QUESTIONS.length), pool: SpyfallTimeTravel_QUESTIONS };

export interface SpyfallTimeTravelSettings { dummy: boolean; }
export type SpyfallTimeTravelState = QuizState;
export type SpyfallTimeTravelAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: SpyfallTimeTravelSettings): SpyfallTimeTravelState {
  return quizInitial(seed, CFG);
}

export function reducer(state: SpyfallTimeTravelState, action: SpyfallTimeTravelAction): SpyfallTimeTravelState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: SpyfallTimeTravelState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
