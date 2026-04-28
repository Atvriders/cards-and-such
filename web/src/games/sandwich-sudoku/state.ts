import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface SandwichSudokuSettings { dummy: boolean; }
export interface SandwichSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SandwichSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Sandwich clue 0 in a row. The 1 and 9 are?",
    "choices": [
      "adjacent",
      "opposite ends",
      "unknown",
      "both at start"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Clue 35 in a row of 9 cells: how many cells between 1 and 9?",
    "choices": [
      "3",
      "5",
      "7",
      "none"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Clue 17 in a row. Between 1 and 9 are exactly which digits?",
    "choices": [
      "2,7,8",
      "2,3,4,8",
      "2,7,8 = sum 17",
      "8,9 = sum 17"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Sandwich clue 0 means 1 and 9 are next to each other. True?",
    "choices": [
      "true",
      "false",
      "sometimes",
      "only in column"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Smallest possible sandwich clue?",
    "choices": [
      "0",
      "1",
      "2",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Largest possible sandwich clue (sum of 2-8)?",
    "choices": [
      "35",
      "36",
      "45",
      "42"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SandwichSudokuSettings): SandwichSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SandwichSudokuState, action: SandwichSudokuAction): SandwichSudokuState {
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
export function isTerminal(state: SandwichSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
