import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GeekOutQuizSettings { rounds: "10"; }

export interface QuizQ { q: string; a: string[]; c: number }

export const QUESTIONS: QuizQ[] = [
  {
    "q": "Geek Out is published by?",
    "a": [
      "Playroom",
      "Hasbro",
      "Mattel",
      "Asmodee"
    ],
    "c": 0
  },
  {
    "q": "Players bid what?",
    "a": [
      "Number of items",
      "Time",
      "Money",
      "Cards"
    ],
    "c": 0
  },
  {
    "q": "Categories are mostly about?",
    "a": [
      "Geek topics",
      "Sports",
      "Cooking",
      "Music"
    ],
    "c": 0
  },
  {
    "q": "What is a 'coin'?",
    "a": [
      "Score token",
      "Currency",
      "Reward",
      "Penalty"
    ],
    "c": 0
  },
  {
    "q": "Number of category types?",
    "a": [
      "50",
      "100",
      "200",
      "400"
    ],
    "c": 1
  },
  {
    "q": "Game type?",
    "a": [
      "Trivia bid",
      "Strategy",
      "Card draft",
      "RPG"
    ],
    "c": 0
  },
  {
    "q": "Recommended players?",
    "a": [
      "2-5",
      "6",
      "10+",
      "Any"
    ],
    "c": 0
  },
  {
    "q": "Game length?",
    "a": [
      "20-30 min",
      "5 min",
      "60 min",
      "2 hr"
    ],
    "c": 0
  },
  {
    "q": "Win condition?",
    "a": [
      "Most coins",
      "Empty hand",
      "Highest score",
      "Lowest score"
    ],
    "c": 0
  },
  {
    "q": "Geek Out includes which expansions?",
    "a": [
      "TV/Movie",
      "Sports",
      "Music",
      "Travel"
    ],
    "c": 0
  }
];

export interface GeekOutQuizState {
  rngSeed: number;
  order: number[];
  index: number;
  score: number;
  selected: number | null;
  phase: "ready" | "answered" | "gameover";
}

export type GeekOutQuizAction = { type: "answer"; choice: number } | { type: "next" };

function shuffle(seed: number, n: number): { order: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { order: arr, nextSeed: (seed + 333) >>> 0 };
}

export function initialState(seed: number, _s: GeekOutQuizSettings): GeekOutQuizState {
  const { order } = shuffle(seed, QUESTIONS.length);
  return { rngSeed: seed >>> 0, order, index: 0, score: 0, selected: null, phase: "ready" };
}

export function reducer(state: GeekOutQuizState, action: GeekOutQuizAction): GeekOutQuizState {
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

export function isTerminal(state: GeekOutQuizState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
