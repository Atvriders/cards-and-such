import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const TelestrationsUpsideQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "How many players is classic Telestrations designed for?",
    "choices": [
      "2–4",
      "4–8",
      "8–12",
      "Up to 20"
    ],
    "answer": 1
  },
  {
    "q": "Telestrations alternates between which two actions?",
    "choices": [
      "Sing and hum",
      "Draw and guess",
      "Act and shout",
      "Roll and read"
    ],
    "answer": 1
  },
  {
    "q": "Telestrations was first released in?",
    "choices": [
      "2000",
      "2009",
      "2015",
      "1995"
    ],
    "answer": 1
  },
  {
    "q": "Each player passes their sketchbook how often?",
    "choices": [
      "Once total",
      "After each phase",
      "At the end",
      "Never"
    ],
    "answer": 1
  },
  {
    "q": "Standard Telestrations turn length is?",
    "choices": [
      "30 sec",
      "60 sec",
      "90 sec",
      "3 min"
    ],
    "answer": 1
  },
  {
    "q": "Telestrations is published by which company?",
    "choices": [
      "Mattel",
      "USAopoly",
      "Hasbro",
      "Asmodee"
    ],
    "answer": 1
  },
  {
    "q": "After Dark edition is targeted at?",
    "choices": [
      "Children",
      "Adults",
      "Toddlers",
      "Pets"
    ],
    "answer": 1
  },
  {
    "q": "Each player receives at the start?",
    "choices": [
      "Cards only",
      "Sketchbook + dry-erase pen",
      "Dice",
      "A board"
    ],
    "answer": 1
  },
  {
    "q": "Telestrations evolved from which folk game?",
    "choices": [
      "Pictionary",
      "Telephone with sketches",
      "Charades",
      "Scattergories"
    ],
    "answer": 1
  },
  {
    "q": "Maximum players in standard Telestrations is?",
    "choices": [
      "6",
      "8",
      "12",
      "20"
    ],
    "answer": 1
  },
  {
    "q": "Drawing books in original box?",
    "choices": [
      "4",
      "6",
      "8",
      "12"
    ],
    "answer": 2
  },
  {
    "q": "After completing your sketchbook you read aloud?",
    "choices": [
      "Your last guess",
      "Whole evolution",
      "Only word 1",
      "Nothing"
    ],
    "answer": 1
  }
];

const CFG = { totalQuestions: Math.min(10, TelestrationsUpsideQuiz_QUESTIONS.length), pool: TelestrationsUpsideQuiz_QUESTIONS };

export interface TelestrationsUpsideQuizSettings { dummy: boolean; }
export type TelestrationsUpsideQuizState = QuizState;
export type TelestrationsUpsideQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: TelestrationsUpsideQuizSettings): TelestrationsUpsideQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: TelestrationsUpsideQuizState, action: TelestrationsUpsideQuizAction): TelestrationsUpsideQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: TelestrationsUpsideQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
