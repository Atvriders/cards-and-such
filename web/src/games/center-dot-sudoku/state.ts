import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface CenterDotSudokuSettings { dummy: boolean; }
export interface CenterDotSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type CenterDotSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Center-dot region shows {1,2,3,4,5,6,7,9}. Missing digit?",
    "choices": [
      "7",
      "8",
      "9",
      "none"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "How many cells form the center-dot region in 9x9 Sudoku?",
    "choices": [
      "7",
      "8",
      "9",
      "12"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Center-dot cells overlap which other regions?",
    "choices": [
      "one box each, one row each, one col each",
      "two boxes",
      "one box only",
      "none"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Each center-dot cell is positioned where in its box?",
    "choices": [
      "corner",
      "edge",
      "center",
      "random"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "If center-dot region has 7 of its 9 cells filled with {1,3,4,5,6,8,9}, missing pair?",
    "choices": [
      "2 and 7",
      "2 and 6",
      "1 and 9",
      "3 and 7"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "If a center-dot cell is 5, can another center-dot cell also be 5?",
    "choices": [
      "yes",
      "no",
      "yes if in different row",
      "yes if in different box"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: CenterDotSudokuSettings): CenterDotSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: CenterDotSudokuState, action: CenterDotSudokuAction): CenterDotSudokuState {
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
export function isTerminal(state: CenterDotSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
