import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const Drawful2Quiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Drawful is what?",
    "choices": [
      "Sketch + guess",
      "Trivia",
      "Numbers",
      "Words only"
    ],
    "answer": 0
  },
  {
    "q": "Drawful prompt arrives via?",
    "choices": [
      "Phone",
      "Cards",
      "Dice",
      "TV only"
    ],
    "answer": 0
  },
  {
    "q": "Players guess by?",
    "choices": [
      "Typing fake titles",
      "Multiple choice",
      "Speaking",
      "Drawing"
    ],
    "answer": 0
  },
  {
    "q": "Score for tricking others?",
    "choices": [
      "Yes, +500",
      "None",
      "Negative",
      "Skip"
    ],
    "answer": 0
  },
  {
    "q": "Drawful 2 features?",
    "choices": [
      "Custom prompts",
      "Music",
      "Cards",
      "Dice"
    ],
    "answer": 0
  },
  {
    "q": "Player count?",
    "choices": [
      "3–8",
      "12+",
      "2",
      "20"
    ],
    "answer": 0
  },
  {
    "q": "Drawful is by?",
    "choices": [
      "Jackbox",
      "Hasbro",
      "CMON",
      "USAopoly"
    ],
    "answer": 0
  },
  {
    "q": "Drawful is part of pack?",
    "choices": [
      "Pack 1",
      "Pack 9",
      "Pack 8",
      "Pack 0"
    ],
    "answer": 0
  },
  {
    "q": "Drawful 2 is part of pack?",
    "choices": [
      "Pack 4",
      "Pack 1",
      "Pack 9",
      "Pack 0"
    ],
    "answer": 0
  },
  {
    "q": "Audience can?",
    "choices": [
      "Vote",
      "Draw",
      "Speak",
      "Veto"
    ],
    "answer": 0
  },
  {
    "q": "Sketches are drawn on?",
    "choices": [
      "Phone",
      "Tablet",
      "Paper",
      "TV remote"
    ],
    "answer": 0
  },
  {
    "q": "Final round is?",
    "choices": [
      "Bonus round only",
      "Standard final",
      "No different",
      "Skipped"
    ],
    "answer": 1
  }
];

const CFG = { totalQuestions: Math.min(10, Drawful2Quiz_QUESTIONS.length), pool: Drawful2Quiz_QUESTIONS };

export interface Drawful2QuizSettings { dummy: boolean; }
export type Drawful2QuizState = QuizState;
export type Drawful2QuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: Drawful2QuizSettings): Drawful2QuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: Drawful2QuizState, action: Drawful2QuizAction): Drawful2QuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: Drawful2QuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
