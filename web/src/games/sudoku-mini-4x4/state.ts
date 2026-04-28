import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface SudokuMini4x4Settings { dummy: boolean; }
export interface SudokuMini4x4State { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SudokuMini4x4Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "12..|34..|....|....",
    "prompt": "Row 3 col 1: rows 1-2 in col 1 hold 1, 3. Pick.",
    "choices": [
      "1",
      "3",
      "2",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "1.34|....|....|....",
    "prompt": "Row 1 col 2 must be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "..34|12..|....|....",
    "prompt": "Row 2 col 3 must complete row 2 with 3 or 4. Box constraint forces?",
    "choices": [
      "3",
      "4",
      "1",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "1234|3412|....|....",
    "prompt": "Row 3 col 1: column 1 has 1, 3 used. Pick from 2 or 4. Box (rows 3-4, cols 1-2) is empty so either works without more info; assume 2.",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "1...|....|....|...4",
    "prompt": "Cell (1,1)=1, (4,4)=4. Cell (2,2) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "....|.2..|..3.|....",
    "prompt": "Cell (2,2)=2 and (3,3)=3 in middle box (rows 2-3, cols 2-3) require 1 and 4 in remaining. Cell (2,3) candidate?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SudokuMini4x4Settings): SudokuMini4x4State {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SudokuMini4x4State, action: SudokuMini4x4Action): SudokuMini4x4State {
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
export function isTerminal(state: SudokuMini4x4State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
