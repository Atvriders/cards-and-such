import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface OffsetSudokuMiniSettings { dummy: boolean; }
export interface OffsetSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type OffsetSudokuMiniStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1234|2.41|3412|4123",
    "prompt": "Cell (2,2) is shifted box — what fills?",
    "choices": [
      "3",
      "2",
      "4",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "12.4|3412|.123|41.2",
    "prompt": "Offset box B contains 1,2,4 — needs?",
    "choices": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "123.|.231|31.2|2413",
    "prompt": "Last cell of row 1?",
    "choices": [
      "4",
      "3",
      "2",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": ".123|2341|3412|412.",
    "prompt": "Row 4 ends with which digit?",
    "choices": [
      "3",
      "4",
      "1",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "1.34|.4.2|3.1.|.213",
    "prompt": "Cell (2,1) — only one fits.",
    "choices": [
      "2",
      "1",
      "4",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "12..|34..|..3.|..12",
    "prompt": "Offset box overlap — pick (2,4).",
    "choices": [
      "4",
      "2",
      "3",
      "1"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: OffsetSudokuMiniSettings): OffsetSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: OffsetSudokuMiniState, action: OffsetSudokuMiniStateAction): OffsetSudokuMiniState {
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
export function isTerminal(state: OffsetSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
