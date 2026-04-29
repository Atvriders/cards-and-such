import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TacoCatGoatQuizSettings { rounds: "10"; }

export interface QuizQ { q: string; a: string[]; c: number }

export const QUESTIONS: QuizQ[] = [
  {
    "q": "What is the chant?",
    "a": [
      "Taco Cat Goat Cheese Pizza",
      "Cat Dog Mouse",
      "Hamburger Fry",
      "Ice Coffee Tea"
    ],
    "c": 0
  },
  {
    "q": "When do you slap?",
    "a": [
      "When card matches chant",
      "Always",
      "Never",
      "On taco"
    ],
    "c": 0
  },
  {
    "q": "How many slap-trigger cards?",
    "a": [
      "1",
      "2",
      "3",
      "5"
    ],
    "c": 2
  },
  {
    "q": "Goal of the game?",
    "a": [
      "Empty hand",
      "Most cards",
      "Highest score",
      "Last standing"
    ],
    "c": 0
  },
  {
    "q": "Which is a special slap card?",
    "a": [
      "Gorilla",
      "Eagle",
      "Whale",
      "Snake"
    ],
    "c": 0
  },
  {
    "q": "How do you handle Narwhal card?",
    "a": [
      "Salute",
      "Slap",
      "Roar",
      "Dance"
    ],
    "c": 1
  },
  {
    "q": "Game style?",
    "a": [
      "Reaction",
      "Trivia",
      "Strategy",
      "Word"
    ],
    "c": 0
  },
  {
    "q": "Designer Dave Campbell brand?",
    "a": [
      "Dolphin Hat",
      "Oni Press",
      "CMON",
      "Z-Man"
    ],
    "c": 0
  },
  {
    "q": "Recommended players?",
    "a": [
      "2",
      "2-8",
      "4+",
      "8+"
    ],
    "c": 1
  },
  {
    "q": "Game length?",
    "a": [
      "5-15 min",
      "30 min",
      "45 min",
      "60 min"
    ],
    "c": 0
  }
];

export interface TacoCatGoatQuizState {
  rngSeed: number;
  order: number[];
  index: number;
  score: number;
  selected: number | null;
  phase: "ready" | "answered" | "gameover";
}

export type TacoCatGoatQuizAction = { type: "answer"; choice: number } | { type: "next" };

function shuffle(seed: number, n: number): { order: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { order: arr, nextSeed: (seed + 333) >>> 0 };
}

export function initialState(seed: number, _s: TacoCatGoatQuizSettings): TacoCatGoatQuizState {
  const { order } = shuffle(seed, QUESTIONS.length);
  return { rngSeed: seed >>> 0, order, index: 0, score: 0, selected: null, phase: "ready" };
}

export function reducer(state: TacoCatGoatQuizState, action: TacoCatGoatQuizAction): TacoCatGoatQuizState {
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

export function isTerminal(state: TacoCatGoatQuizState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
