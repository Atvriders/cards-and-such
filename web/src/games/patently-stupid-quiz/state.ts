import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PatentlyStupidQuizSettings { rounds: "10"; }

export interface QuizQ { q: string; a: string[]; c: number }

export const QUESTIONS: QuizQ[] = [
  {
    "q": "What is Patently Stupid about?",
    "a": [
      "Inventing products",
      "Trivia",
      "Drawing",
      "Words"
    ],
    "c": 0
  },
  {
    "q": "Players pitch what?",
    "a": [
      "Solutions",
      "Stories",
      "Drawings",
      "Songs"
    ],
    "c": 0
  },
  {
    "q": "Designer Cards Against Humanity team made it?",
    "a": [
      "Yes",
      "No",
      "Indirect",
      "Unknown"
    ],
    "c": 0
  },
  {
    "q": "Gameplay components include?",
    "a": [
      "Drawings + cards",
      "Dice",
      "Tokens",
      "Boards"
    ],
    "c": 0
  },
  {
    "q": "Players vote what's best?",
    "a": [
      "Funniest",
      "Smartest",
      "Most useful",
      "Cheapest"
    ],
    "c": 0
  },
  {
    "q": "Recommended players?",
    "a": [
      "3-8",
      "2",
      "10+",
      "20+"
    ],
    "c": 0
  },
  {
    "q": "Game length?",
    "a": [
      "30 min",
      "5 min",
      "60 min",
      "2 hr"
    ],
    "c": 0
  },
  {
    "q": "Game category?",
    "a": [
      "Party invent",
      "Trivia",
      "Strategy",
      "Word"
    ],
    "c": 0
  },
  {
    "q": "Each player gets supplies?",
    "a": [
      "Marker + paper",
      "Cards",
      "Tokens",
      "Boards"
    ],
    "c": 0
  },
  {
    "q": "Win condition?",
    "a": [
      "Most votes",
      "Most coins",
      "Highest pitch",
      "Lowest"
    ],
    "c": 0
  }
];

export interface PatentlyStupidQuizState {
  rngSeed: number;
  order: number[];
  index: number;
  score: number;
  selected: number | null;
  phase: "ready" | "answered" | "gameover";
}

export type PatentlyStupidQuizAction = { type: "answer"; choice: number } | { type: "next" };

function shuffle(seed: number, n: number): { order: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { order: arr, nextSeed: (seed + 333) >>> 0 };
}

export function initialState(seed: number, _s: PatentlyStupidQuizSettings): PatentlyStupidQuizState {
  const { order } = shuffle(seed, QUESTIONS.length);
  return { rngSeed: seed >>> 0, order, index: 0, score: 0, selected: null, phase: "ready" };
}

export function reducer(state: PatentlyStupidQuizState, action: PatentlyStupidQuizAction): PatentlyStupidQuizState {
  if (state.phase === "gameover") return state;
  if (action.type === "answer") {
    if (state.phase !== "ready") return state;
    const qi = state.order[state.index];
    if (qi === undefined) return state;
    const q = QUESTIONS[qi]!;
    const correct = action.choice === q.c;
    return { ...state, selected: action.choice, score: state.score + (correct ? 100 : 0), phase: "answered" };
  }
  if (action.type === "next") {
    if (state.phase !== "answered") return state;
    if (state.index + 1 >= QUESTIONS.length) return { ...state, phase: "gameover" };
    return { ...state, index: state.index + 1, selected: null, phase: "ready" };
  }
  return state;
}

export function isTerminal(state: PatentlyStupidQuizState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
