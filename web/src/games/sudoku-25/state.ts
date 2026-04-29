import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface Sudoku25Settings { dummy: boolean; }
export interface Sudoku25State { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type Sudoku25StateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "row 17 cell 8: row already has 1-7,9-25 except 8 missing",
    "prompt": "What digit is missing from row 17?",
    "choices": [
      "8",
      "18",
      "9",
      "13"
    ],
    "correct": 0
  },
  {
    "grid": "box (4,2) contains 1,3,5,7,9,11,13,15,17,19,21,23,25 + odd evens",
    "prompt": "The single missing cell in box (4,2) — what fits?",
    "choices": [
      "10",
      "2",
      "6",
      "20"
    ],
    "correct": 0
  },
  {
    "grid": "col 14 has all but two values: 6 and 12 missing",
    "prompt": "Other constraints fix col 14 row 9 to be?",
    "choices": [
      "12",
      "6",
      "14",
      "20"
    ],
    "correct": 0
  },
  {
    "grid": "3 in row 5 must be in cols 17-21 only",
    "prompt": "Naked pair narrows to col 19 — value is?",
    "choices": [
      "3",
      "13",
      "8",
      "17"
    ],
    "correct": 0
  },
  {
    "grid": "box (1,1) needs 1,2,...,25 — only 17 missing",
    "prompt": "Cell (3,4) must contain?",
    "choices": [
      "17",
      "7",
      "11",
      "25"
    ],
    "correct": 0
  },
  {
    "grid": "hidden single across box (2,5)",
    "prompt": "The digit only fitting cell (8,23) is?",
    "choices": [
      "19",
      "23",
      "11",
      "5"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: Sudoku25Settings): Sudoku25State {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: Sudoku25State, action: Sudoku25StateAction): Sudoku25State {
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
export function isTerminal(state: Sudoku25State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
