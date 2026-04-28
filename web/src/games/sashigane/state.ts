import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface SashiganeSettings { dummy: boolean; }
export interface SashiganeState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SashiganeAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Each region in Sashigane is shaped like?",
    "choices": [
      "square",
      "rectangle",
      "L-shape",
      "triangle"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "An L is 1 cell wide along its strip. True?",
    "choices": [
      "true",
      "false",
      "only big Ls",
      "only at edges"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "How many circles per L-region?",
    "choices": [
      "0",
      "1",
      "2",
      "variable"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "An L of total length 3 has shape like?",
    "choices": [
      "1x3 line",
      "2 cells + 1 bend",
      "3 cells unbent",
      "not allowed"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Smallest valid L size?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two L-regions can overlap?",
    "choices": [
      "yes",
      "no",
      "only at corners",
      "only same length"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SashiganeSettings): SashiganeState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SashiganeState, action: SashiganeAction): SashiganeState {
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
export function isTerminal(state: SashiganeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
