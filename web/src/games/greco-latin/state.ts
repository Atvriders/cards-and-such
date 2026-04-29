import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface GrecoLatinSettings { dummy: boolean; }
export interface GrecoLatinState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type GrecoLatinAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "Aa..|....|....|....",
    "prompt": "Aa at (1,1). Cell (1,2) cannot have which?",
    "choices": [
      "Aa (repeat)",
      "Bb",
      "Bc",
      "Cd"
    ],
    "correct": 0
  },
  {
    "grid": "Aa.B|....|....|....",
    "prompt": "Aa at (1,1), B at (1,4). Row 1 needs which Latin letters?",
    "choices": [
      "A,B already used; need C,D",
      "All 4",
      "Only B",
      "Only A"
    ],
    "correct": 0
  },
  {
    "grid": "AaBb|....|....|....",
    "prompt": "Row 1: Aa, Bb in cols 1,2. Pair Aa allowed elsewhere?",
    "choices": [
      "Yes anywhere",
      "No, never repeat",
      "Only in col 1",
      "Only diagonally"
    ],
    "correct": 1
  },
  {
    "grid": "....|.Aa.|....|....",
    "prompt": "Aa at (2,2). Column 2 has used pair Aa. Can Aa appear at (3,2)?",
    "choices": [
      "Yes",
      "No, column repeat",
      "Only if rotated",
      "Only diagonally"
    ],
    "correct": 1
  },
  {
    "grid": "AbBa|....|....|....",
    "prompt": "Pairs Ab, Ba in row 1. Are they distinct pairs (different)?",
    "choices": [
      "Yes, distinct",
      "No, same pair",
      "Same first letter only",
      "Same second letter only"
    ],
    "correct": 0
  },
  {
    "grid": "Aa..|.Bb.|..Cc|....",
    "prompt": "Diagonal pairs Aa, Bb, Cc filled. Cell (4,4) needs?",
    "choices": [
      "Aa",
      "Dd",
      "Ad",
      "Da"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: GrecoLatinSettings): GrecoLatinState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: GrecoLatinState, action: GrecoLatinAction): GrecoLatinState {
  if (state.phase === "done") return state;
  if (action.type === "select") return state.submitted ? state : { ...state, selected: action.choice };
  if (action.type === "submit") {
    if (state.submitted || state.selected === null) return state;
    const p = state.puzzles[state.idx]!;
    const ok = state.selected === p.correct;
    return { ...state, submitted: true, phase: "result", score: state.score + (ok ? 100 : 0), correct: state.correct + (ok ? 1 : 0) };
  }
  if (action.type === "next") {
    const ni = state.idx + 1;
    if (ni >= state.puzzles.length) return { ...state, phase: "done" };
    return { ...state, idx: ni, selected: null, submitted: false, phase: "playing" };
  }
  return state;
}
export function isTerminal(state: GrecoLatinState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
