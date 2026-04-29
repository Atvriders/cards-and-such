import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Drawful2QuizSettings { rounds: "10"; }

export interface QuizQ { q: string; a: string[]; c: number }

export const QUESTIONS: QuizQ[] = [
  {
    "q": "Drawful 2 is by?",
    "a": [
      "Jackbox",
      "Hasbro",
      "Mattel",
      "Asmodee"
    ],
    "c": 0
  },
  {
    "q": "Number of players?",
    "a": [
      "3-8",
      "2",
      "10+",
      "20+"
    ],
    "c": 0
  },
  {
    "q": "Players draw on what?",
    "a": [
      "Phone",
      "Paper",
      "Tablet",
      "Easel"
    ],
    "c": 0
  },
  {
    "q": "Goal in Drawful 2?",
    "a": [
      "Trick others with caption",
      "Best art",
      "Most colors",
      "Fastest"
    ],
    "c": 0
  },
  {
    "q": "Drawful 2 is in which Jackbox pack?",
    "a": [
      "3",
      "2",
      "Standalone",
      "1"
    ],
    "c": 0
  },
  {
    "q": "Players type fake captions?",
    "a": [
      "Yes",
      "No",
      "Sometimes",
      "Never"
    ],
    "c": 0
  },
  {
    "q": "Audience can also vote?",
    "a": [
      "Yes",
      "No",
      "Only host",
      "Never"
    ],
    "c": 0
  },
  {
    "q": "Game length?",
    "a": [
      "20 min",
      "5 min",
      "60 min",
      "2 hr"
    ],
    "c": 0
  },
  {
    "q": "Game category?",
    "a": [
      "Party draw",
      "Trivia",
      "Strategy",
      "Word"
    ],
    "c": 0
  },
  {
    "q": "How many rounds typically?",
    "a": [
      "2",
      "3",
      "5",
      "10"
    ],
    "c": 0
  }
];

export interface Drawful2QuizState {
  rngSeed: number;
  order: number[];
  index: number;
  score: number;
  selected: number | null;
  phase: "ready" | "answered" | "gameover";
}

export type Drawful2QuizAction = { type: "answer"; choice: number } | { type: "next" };

function shuffle(seed: number, n: number): { order: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { order: arr, nextSeed: (seed + 333) >>> 0 };
}

export function initialState(seed: number, _s: Drawful2QuizSettings): Drawful2QuizState {
  const { order } = shuffle(seed, QUESTIONS.length);
  return { rngSeed: seed >>> 0, order, index: 0, score: 0, selected: null, phase: "ready" };
}

export function reducer(state: Drawful2QuizState, action: Drawful2QuizAction): Drawful2QuizState {
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

export function isTerminal(state: Drawful2QuizState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
