import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface SudokuMini6x6Settings { dummy: boolean; }
export interface SudokuMini6x6State { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SudokuMini6x6Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Row of 6 cells already has 1, 2, 3, 4, 6. Missing digit?",
    "choices": [
      "1",
      "3",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "How many digits in 6x6 mini Sudoku?",
    "choices": [
      "4",
      "5",
      "6",
      "9"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "6x6 box dimensions are?",
    "choices": [
      "2x3",
      "3x3",
      "2x2",
      "3x4"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Column has 1, 2, 4, 5, 6 already. Missing digit?",
    "choices": [
      "1",
      "2",
      "3",
      "6"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "If a 2x3 box shows {1,2,3,4,5}, the sixth cell holds?",
    "choices": [
      "1",
      "6",
      "5",
      "2"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Total cells in 6x6 Sudoku?",
    "choices": [
      "12",
      "16",
      "36",
      "81"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SudokuMini6x6Settings): SudokuMini6x6State {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SudokuMini6x6State, action: SudokuMini6x6Action): SudokuMini6x6State {
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
export function isTerminal(state: SudokuMini6x6State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
