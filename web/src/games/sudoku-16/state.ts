import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface Sudoku16Settings { dummy: boolean; }
export interface Sudoku16State { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type Sudoku16StateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "row 3: 1,2,3,4,5,6,7,8,9,A,B,C,D,E,F + missing 0",
    "prompt": "What's missing from row 3?",
    "choices": [
      "0",
      "1",
      "E",
      "F"
    ],
    "correct": 0
  },
  {
    "grid": "col 11: contains 0-9,A,B,D,E,F + missing C",
    "prompt": "What digit completes col 11?",
    "choices": [
      "C",
      "B",
      "D",
      "A"
    ],
    "correct": 0
  },
  {
    "grid": "box (1,1) has all hex digits except E",
    "prompt": "Cell missing E placed at (4,4)?",
    "choices": [
      "E",
      "D",
      "F",
      "C"
    ],
    "correct": 0
  },
  {
    "grid": "row 12 missing two: 7 and 9",
    "prompt": "Cross-reference with col places 9 at?",
    "choices": [
      "9",
      "7",
      "8",
      "6"
    ],
    "correct": 0
  },
  {
    "grid": "hidden 0 in box (2,3)",
    "prompt": "Only cell allowing 0 is?",
    "choices": [
      "0",
      "1",
      "2",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "naked single in box (4,4)",
    "prompt": "Last empty cell value is?",
    "choices": [
      "F",
      "E",
      "D",
      "C"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: Sudoku16Settings): Sudoku16State {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: Sudoku16State, action: Sudoku16StateAction): Sudoku16State {
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
export function isTerminal(state: Sudoku16State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
