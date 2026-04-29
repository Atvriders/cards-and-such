import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface OffsetKillerSudokuSettings { dummy: boolean; }
export interface OffsetKillerSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type OffsetKillerSudokuStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "cage sum=15, two cells shown=4,3 — third needs 8",
    "prompt": "Cell value?",
    "choices": [
      "8",
      "6",
      "2",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "cage sum=10, cells=2,1 — third=?",
    "prompt": "Pick.",
    "choices": [
      "7",
      "3",
      "5",
      "9"
    ],
    "correct": 0
  },
  {
    "grid": "cage sum=24, cells=9,8 — third=?",
    "prompt": "Pick.",
    "choices": [
      "7",
      "6",
      "9",
      "8"
    ],
    "correct": 0
  },
  {
    "grid": "cage sum=6, cells=2 — pair needs?",
    "prompt": "Pick.",
    "choices": [
      "1",
      "3",
      "4",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "cage sum=20 in shifted box — final cell?",
    "prompt": "Pick.",
    "choices": [
      "9",
      "5",
      "7",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "cage sum=11 across two cells — pick larger",
    "prompt": "Pick.",
    "choices": [
      "7",
      "4",
      "5",
      "8"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: OffsetKillerSudokuSettings): OffsetKillerSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: OffsetKillerSudokuState, action: OffsetKillerSudokuStateAction): OffsetKillerSudokuState {
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
export function isTerminal(state: OffsetKillerSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
