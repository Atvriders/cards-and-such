import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TrialTrolleyQuizSettings { rounds: "10"; }

export interface QuizQ { q: string; a: string[]; c: number }

export const QUESTIONS: QuizQ[] = [
  {
    "q": "Trial by Trolley is based on which thought experiment?",
    "a": [
      "Trolley problem",
      "Prisoner's",
      "Monty Hall",
      "Schrodinger"
    ],
    "c": 0
  },
  {
    "q": "What do players do?",
    "a": [
      "Argue cases",
      "Pass cards",
      "Roll dice",
      "Build engines"
    ],
    "c": 0
  },
  {
    "q": "What's the conductor's role?",
    "a": [
      "Judge winner",
      "Roll dice",
      "Pass cards",
      "Plays both"
    ],
    "c": 0
  },
  {
    "q": "Number of tracks per round?",
    "a": [
      "1",
      "2",
      "3",
      "4"
    ],
    "c": 1
  },
  {
    "q": "Designer studio for Trial by Trolley?",
    "a": [
      "Skybound",
      "Wizards",
      "FFG",
      "Z-Man"
    ],
    "c": 0
  },
  {
    "q": "Game category?",
    "a": [
      "Party",
      "Strategy",
      "Roll-and-write",
      "Cooperative"
    ],
    "c": 0
  },
  {
    "q": "Each player advocates for which side?",
    "a": [
      "One track",
      "Both",
      "Neither",
      "Conductor"
    ],
    "c": 0
  },
  {
    "q": "What color is innocent track?",
    "a": [
      "Red",
      "Blue",
      "Green",
      "Yellow"
    ],
    "c": 1
  },
  {
    "q": "Recommended player count?",
    "a": [
      "3-13",
      "2-4",
      "6+",
      "2"
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
  }
];

export interface TrialTrolleyQuizState {
  rngSeed: number;
  order: number[];
  index: number;
  score: number;
  selected: number | null;
  phase: "ready" | "answered" | "gameover";
}

export type TrialTrolleyQuizAction = { type: "answer"; choice: number } | { type: "next" };

function shuffle(seed: number, n: number): { order: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { order: arr, nextSeed: (seed + 333) >>> 0 };
}

export function initialState(seed: number, _s: TrialTrolleyQuizSettings): TrialTrolleyQuizState {
  const { order } = shuffle(seed, QUESTIONS.length);
  return { rngSeed: seed >>> 0, order, index: 0, score: 0, selected: null, phase: "ready" };
}

export function reducer(state: TrialTrolleyQuizState, action: TrialTrolleyQuizAction): TrialTrolleyQuizState {
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

export function isTerminal(state: TrialTrolleyQuizState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
