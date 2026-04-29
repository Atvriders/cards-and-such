import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HappySalmonMiniSettings { rounds: "10"; }

export interface QuizQ { q: string; a: string[]; c: number }

export const QUESTIONS: QuizQ[] = [
  {
    "q": "How many actions are there in Happy Salmon?",
    "a": [
      "3",
      "4",
      "5",
      "6"
    ],
    "c": 1
  },
  {
    "q": "Which is NOT a Happy Salmon action?",
    "a": [
      "High 5",
      "Pound it",
      "Switcheroo",
      "Roll up"
    ],
    "c": 3
  },
  {
    "q": "How many cards does each player start with?",
    "a": [
      "10",
      "11",
      "12",
      "13"
    ],
    "c": 2
  },
  {
    "q": "What signals 'Happy Salmon'?",
    "a": [
      "Slap forearms",
      "Hug",
      "Wave",
      "Shout"
    ],
    "c": 0
  },
  {
    "q": "What's the win condition?",
    "a": [
      "First to empty hand",
      "Last to empty",
      "Most points",
      "Most loud"
    ],
    "c": 0
  },
  {
    "q": "Which game theme inspired Happy Salmon?",
    "a": [
      "Fish",
      "Rodeo",
      "Dance",
      "Salmon spawning"
    ],
    "c": 3
  },
  {
    "q": "How loud should you be in Happy Salmon?",
    "a": [
      "Silent",
      "Quiet",
      "Loud",
      "Very loud"
    ],
    "c": 3
  },
  {
    "q": "Recommended player count?",
    "a": [
      "2",
      "3-6",
      "6+",
      "Any"
    ],
    "c": 1
  },
  {
    "q": "Average game length?",
    "a": [
      "1 min",
      "2 min",
      "5 min",
      "10 min"
    ],
    "c": 1
  },
  {
    "q": "What kind of game is it?",
    "a": [
      "Strategy",
      "Reaction party",
      "Word",
      "Trivia"
    ],
    "c": 1
  }
];

export interface HappySalmonMiniState {
  rngSeed: number;
  order: number[];
  index: number;
  score: number;
  selected: number | null;
  phase: "ready" | "answered" | "gameover";
}

export type HappySalmonMiniAction = { type: "answer"; choice: number } | { type: "next" };

function shuffle(seed: number, n: number): { order: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { order: arr, nextSeed: (seed + 333) >>> 0 };
}

export function initialState(seed: number, _s: HappySalmonMiniSettings): HappySalmonMiniState {
  const { order } = shuffle(seed, QUESTIONS.length);
  return { rngSeed: seed >>> 0, order, index: 0, score: 0, selected: null, phase: "ready" };
}

export function reducer(state: HappySalmonMiniState, action: HappySalmonMiniAction): HappySalmonMiniState {
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

export function isTerminal(state: HappySalmonMiniState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
