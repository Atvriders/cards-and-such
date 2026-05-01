import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const AvalonQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Avalon: Good guys are?",
    "choices": [
      "Knights of Round Table",
      "Pirates",
      "Mages",
      "Dragons"
    ],
    "answer": 0
  },
  {
    "q": "Bad guys?",
    "choices": [
      "Mordred's minions",
      "Rebels",
      "Vampires",
      "Aliens"
    ],
    "answer": 0
  },
  {
    "q": "Quests are?",
    "choices": [
      "Sent on missions",
      "Drawn cards",
      "Random",
      "Voted"
    ],
    "answer": 0
  },
  {
    "q": "Mission outcome?",
    "choices": [
      "Success or fail",
      "Vote",
      "Random",
      "Skip"
    ],
    "answer": 0
  },
  {
    "q": "Win for good guys?",
    "choices": [
      "3 successful quests",
      "All quests",
      "Vote out",
      "Lie"
    ],
    "answer": 0
  },
  {
    "q": "Win for evil?",
    "choices": [
      "3 failed quests or assassinate Merlin",
      "Lie best",
      "Vote in",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "Special role: Merlin?",
    "choices": [
      "Sees evil",
      "Heals",
      "Spy",
      "Vote 2x"
    ],
    "answer": 0
  },
  {
    "q": "Special role: Mordred?",
    "choices": [
      "Hidden from Merlin",
      "Vote 2x",
      "Heals",
      "Spy"
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
      "2012",
      "2005",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Avalon is by?",
    "choices": [
      "Indie Boards & Cards",
      "Jackbox",
      "Hasbro",
      "Asmodee"
    ],
    "answer": 0
  },
  {
    "q": "Lake of Lady?",
    "choices": [
      "Reveals alignment",
      "Heals",
      "Skips",
      "Lies"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, AvalonQuiz_QUESTIONS.length), pool: AvalonQuiz_QUESTIONS };

export interface AvalonQuizSettings { dummy: boolean; }
export type AvalonQuizState = QuizState;
export type AvalonQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: AvalonQuizSettings): AvalonQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: AvalonQuizState, action: AvalonQuizAction): AvalonQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: AvalonQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
