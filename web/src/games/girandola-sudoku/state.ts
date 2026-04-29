import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface GirandolaSudokuSettings { dummy: boolean; }
export interface GirandolaSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type GirandolaSudokuStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "girandola has 1,2,3,4,5,6,7,9 — needs 8",
    "prompt": "Cell (5,5) must be?",
    "choices": [
      "8",
      "2",
      "6",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "spiral has 2-9 — needs 1",
    "prompt": "Pick.",
    "choices": [
      "1",
      "9",
      "5",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "row+girandola intersect at (4,5)",
    "prompt": "Cell value?",
    "choices": [
      "7",
      "2",
      "4",
      "9"
    ],
    "correct": 0
  },
  {
    "grid": "box+girandola force?",
    "prompt": "Pick.",
    "choices": [
      "3",
      "6",
      "8",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "girandola unique cell deduction",
    "prompt": "Pick.",
    "choices": [
      "5",
      "1",
      "7",
      "9"
    ],
    "correct": 0
  },
  {
    "grid": "whole spiral is symmetric — center=?",
    "prompt": "Pick.",
    "choices": [
      "6",
      "2",
      "4",
      "8"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: GirandolaSudokuSettings): GirandolaSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: GirandolaSudokuState, action: GirandolaSudokuStateAction): GirandolaSudokuState {
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
export function isTerminal(state: GirandolaSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
