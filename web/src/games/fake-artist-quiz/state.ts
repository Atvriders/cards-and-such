import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FakeArtistQuizSettings { rounds: "10"; }

export interface QuizQ { q: string; a: string[]; c: number }

export const QUESTIONS: QuizQ[] = [
  {
    "q": "Game name's full title?",
    "a": [
      "A Fake Artist Goes to New York",
      "Fake Painter",
      "Liar Liar",
      "Mystery Drawer"
    ],
    "c": 0
  },
  {
    "q": "What does the fake artist NOT know?",
    "a": [
      "The theme",
      "The colour",
      "The score",
      "The host"
    ],
    "c": 0
  },
  {
    "q": "Designer of Fake Artist?",
    "a": [
      "Jun Sasaki",
      "Reiner Knizia",
      "Wolfgang Kramer",
      "Donald Vaccarino"
    ],
    "c": 0
  },
  {
    "q": "Studio that publishes it?",
    "a": [
      "Oink Games",
      "Kosmos",
      "FFG",
      "Z-Man"
    ],
    "c": 0
  },
  {
    "q": "Each player draws how much per turn?",
    "a": [
      "One stroke",
      "Full picture",
      "Three strokes",
      "Nothing"
    ],
    "c": 0
  },
  {
    "q": "Who picks the theme?",
    "a": [
      "Question Master",
      "Fake artist",
      "Player one",
      "Random"
    ],
    "c": 0
  },
  {
    "q": "Recommended players?",
    "a": [
      "5-10",
      "2",
      "12+",
      "20+"
    ],
    "c": 0
  },
  {
    "q": "Game length?",
    "a": [
      "20 min",
      "60 min",
      "2 hr",
      "5 min"
    ],
    "c": 0
  },
  {
    "q": "Box style?",
    "a": [
      "Pocket-size",
      "Large box",
      "Tin",
      "Bag"
    ],
    "c": 0
  },
  {
    "q": "Game category?",
    "a": [
      "Party deduction",
      "Trivia",
      "RPG",
      "Strategy"
    ],
    "c": 0
  }
];

export interface FakeArtistQuizState {
  rngSeed: number;
  order: number[];
  index: number;
  score: number;
  selected: number | null;
  phase: "ready" | "answered" | "gameover";
}

export type FakeArtistQuizAction = { type: "answer"; choice: number } | { type: "next" };

function shuffle(seed: number, n: number): { order: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { order: arr, nextSeed: (seed + 333) >>> 0 };
}

export function initialState(seed: number, _s: FakeArtistQuizSettings): FakeArtistQuizState {
  const { order } = shuffle(seed, QUESTIONS.length);
  return { rngSeed: seed >>> 0, order, index: 0, score: 0, selected: null, phase: "ready" };
}

export function reducer(state: FakeArtistQuizState, action: FakeArtistQuizAction): FakeArtistQuizState {
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

export function isTerminal(state: FakeArtistQuizState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
