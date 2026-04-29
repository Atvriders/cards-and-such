import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface QuadrupleClueSudokuSettings { dummy: boolean; }
export interface QuadrupleClueSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type QuadrupleClueSudokuStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "intersection {1,3,5,7}, NE cell row+col rule out 5 and 7",
    "prompt": "NE cell value is?",
    "choices": [
      "1",
      "3",
      "5",
      "7"
    ],
    "correct": 0
  },
  {
    "grid": "{2,4,6,8} at intersection — column has 2,4,6",
    "prompt": "NW cell must be?",
    "choices": [
      "8",
      "2",
      "4",
      "6"
    ],
    "correct": 0
  },
  {
    "grid": "{1,9,3,7} — row has 1,9,3",
    "prompt": "SW cell?",
    "choices": [
      "7",
      "1",
      "3",
      "9"
    ],
    "correct": 0
  },
  {
    "grid": "{2,5,4,9} — box has 5,4",
    "prompt": "Cell value?",
    "choices": [
      "2",
      "9",
      "4",
      "5"
    ],
    "correct": 0
  },
  {
    "grid": "{1,2,6,8} — col has 6",
    "prompt": "SE cell?",
    "choices": [
      "8",
      "2",
      "6",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "{3,4,7,9} — row has 4,7,9",
    "prompt": "Cell value?",
    "choices": [
      "3",
      "9",
      "7",
      "4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: QuadrupleClueSudokuSettings): QuadrupleClueSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: QuadrupleClueSudokuState, action: QuadrupleClueSudokuStateAction): QuadrupleClueSudokuState {
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
export function isTerminal(state: QuadrupleClueSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
