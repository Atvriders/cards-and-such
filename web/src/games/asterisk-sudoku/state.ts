import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface AsteriskSudokuSettings { dummy: boolean; }
export interface AsteriskSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type AsteriskSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Asterisk has 9 cells. If 8 are filled with 1-8, the last must be?",
    "choices": [
      "1",
      "9",
      "8",
      "any"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Asterisk currently shows {2,3,5,6,7,8,9}. Missing pair?",
    "choices": [
      "1 and 4",
      "1 and 5",
      "2 and 4",
      "3 and 4"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Asterisk holds digit count of how many?",
    "choices": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Asterisk uses each digit 1-9 exactly once. True?",
    "choices": [
      "true",
      "false",
      "only in solved state",
      "never"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Asterisk cells in 9x9 are typically located in?",
    "choices": [
      "each row's middle",
      "each box's central cell + 4 mid-edge box centers",
      "each column's first cell",
      "the diagonals"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "If the asterisk is missing 6 and contains 8, can box-7 have 6 elsewhere?",
    "choices": [
      "yes",
      "no",
      "depends on column",
      "never"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: AsteriskSudokuSettings): AsteriskSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: AsteriskSudokuState, action: AsteriskSudokuAction): AsteriskSudokuState {
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
export function isTerminal(state: AsteriskSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
