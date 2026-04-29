import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ThrowThrowBurritoQuizSettings { rounds: "10"; }

export interface QuizQ { q: string; a: string[]; c: number }

export const QUESTIONS: QuizQ[] = [
  {
    "q": "What is the 'weapon' in Throw Throw Burrito?",
    "a": [
      "Foam burrito",
      "Ball",
      "Pillow",
      "Sock"
    ],
    "c": 0
  },
  {
    "q": "Throw Throw Burrito is by which creators?",
    "a": [
      "Exploding Kittens",
      "Cards Against Humanity",
      "Hasbro",
      "Mattel"
    ],
    "c": 0
  },
  {
    "q": "What do you collect to win?",
    "a": [
      "Sets",
      "Pairs",
      "Sequences",
      "Single cards"
    ],
    "c": 0
  },
  {
    "q": "How many cards in a winning set?",
    "a": [
      "2",
      "3",
      "4",
      "5"
    ],
    "c": 1
  },
  {
    "q": "What happens during a 'Burrito War'?",
    "a": [
      "Throw",
      "Negotiate",
      "Wait",
      "Pass"
    ],
    "c": 0
  },
  {
    "q": "How many burritos come with the game?",
    "a": [
      "1",
      "2",
      "3",
      "4"
    ],
    "c": 1
  },
  {
    "q": "What action card slows others?",
    "a": [
      "Brawl",
      "Steal",
      "Swap",
      "Reveal"
    ],
    "c": 0
  },
  {
    "q": "Recommended players?",
    "a": [
      "2",
      "2-6",
      "4+",
      "6+"
    ],
    "c": 1
  },
  {
    "q": "Game length?",
    "a": [
      "5-10 min",
      "30 min",
      "1 hr",
      "2 hr"
    ],
    "c": 0
  },
  {
    "q": "Game type?",
    "a": [
      "Card matching",
      "Trivia",
      "Strategy",
      "Word"
    ],
    "c": 0
  }
];

export interface ThrowThrowBurritoQuizState {
  rngSeed: number;
  order: number[];
  index: number;
  score: number;
  selected: number | null;
  phase: "ready" | "answered" | "gameover";
}

export type ThrowThrowBurritoQuizAction = { type: "answer"; choice: number } | { type: "next" };

function shuffle(seed: number, n: number): { order: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { order: arr, nextSeed: (seed + 333) >>> 0 };
}

export function initialState(seed: number, _s: ThrowThrowBurritoQuizSettings): ThrowThrowBurritoQuizState {
  const { order } = shuffle(seed, QUESTIONS.length);
  return { rngSeed: seed >>> 0, order, index: 0, score: 0, selected: null, phase: "ready" };
}

export function reducer(state: ThrowThrowBurritoQuizState, action: ThrowThrowBurritoQuizAction): ThrowThrowBurritoQuizState {
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

export function isTerminal(state: ThrowThrowBurritoQuizState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
