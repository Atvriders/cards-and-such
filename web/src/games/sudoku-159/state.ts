import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface Sudoku159Settings { dummy: boolean; }
export interface Sudoku159State { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type Sudoku159StateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "row 5 col 1 = 7 — means 1 at row 5 col 7",
    "prompt": "Cell (5,3) row 5 has 1 at col 7 only — what fills col 3?",
    "choices": [
      "3",
      "7",
      "1",
      "9"
    ],
    "correct": 0
  },
  {
    "grid": "row 2 col 5 = 9 — 5 sits at col 9",
    "prompt": "Cell (2,4)?",
    "choices": [
      "6",
      "9",
      "5",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "row 7 col 9 = 3 — 9 at col 3",
    "prompt": "Cell (7,3)?",
    "choices": [
      "9",
      "3",
      "7",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "row 4 col 1 = col 5 = same digit forces?",
    "prompt": "Cell (4,7)?",
    "choices": [
      "4",
      "8",
      "2",
      "6"
    ],
    "correct": 0
  },
  {
    "grid": "chain: 1->5->9 across",
    "prompt": "Pick row 1 col 4.",
    "choices": [
      "5",
      "1",
      "3",
      "7"
    ],
    "correct": 0
  },
  {
    "grid": "self-reference loop",
    "prompt": "Pick.",
    "choices": [
      "7",
      "2",
      "9",
      "4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: Sudoku159Settings): Sudoku159State {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: Sudoku159State, action: Sudoku159StateAction): Sudoku159State {
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
export function isTerminal(state: Sudoku159State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
