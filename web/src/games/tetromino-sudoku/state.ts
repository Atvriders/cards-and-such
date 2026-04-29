import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface TetrominoSudokuSettings { dummy: boolean; }
export interface TetrominoSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type TetrominoSudokuStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "L-tetromino contains 3,5,7 — needs?",
    "prompt": "Cell value?",
    "choices": [
      "1",
      "9",
      "2",
      "8"
    ],
    "correct": 0
  },
  {
    "grid": "T-tetromino at (4,4)-(4,5)-(4,6)-(5,5) — has 1,2,4",
    "prompt": "Pick.",
    "choices": [
      "7",
      "9",
      "8",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "I-tetromino vertical 1,3,5 — needs?",
    "prompt": "Pick.",
    "choices": [
      "7",
      "9",
      "2",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "S-tetromino has 6,8,9",
    "prompt": "Pick.",
    "choices": [
      "3",
      "1",
      "5",
      "7"
    ],
    "correct": 0
  },
  {
    "grid": "O-tetromino at corner has three of {2,4,6,8}",
    "prompt": "Cell?",
    "choices": [
      "7",
      "3",
      "5",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "Z-tetromino has 1,7,9 — needs?",
    "prompt": "Pick.",
    "choices": [
      "3",
      "2",
      "4",
      "6"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: TetrominoSudokuSettings): TetrominoSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: TetrominoSudokuState, action: TetrominoSudokuStateAction): TetrominoSudokuState {
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
export function isTerminal(state: TetrominoSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
