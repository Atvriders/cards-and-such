import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface SashiganeMiniSettings { dummy: boolean; }
export interface SashiganeMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SashiganeMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "L...|L...|LL..|....",
    "prompt": "L of size 4 at column 1, rows 1-3, then row 3 col 2. Arrow at bend (3,1) points right. Where is end?",
    "choices": [
      "(3,1)",
      "(3,2)",
      "(3,3)",
      "(2,1)"
    ],
    "correct": 1
  },
  {
    "grid": "LL..|L...|....|....",
    "prompt": "Visible cells: (1,1), (1,2), (2,1). What size is this L so far?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "grid": "L...|L...|....|....",
    "prompt": "Two cells in column 1: (1,1), (2,1). To form an L of size 3, where is the bend?",
    "choices": [
      "(2,2)",
      "(3,1)",
      "(1,2)",
      "(2,1) self"
    ],
    "correct": 0
  },
  {
    "grid": "...L|...L|....|....",
    "prompt": "Cells at (1,4), (2,4). To extend into an L of size 3, the bend cell goes where?",
    "choices": [
      "(2,3)",
      "(1,3)",
      "(3,4)",
      "(2,5)"
    ],
    "correct": 0
  },
  {
    "grid": "LLLL|L...|....|....",
    "prompt": "Cells (1,1)-(1,4) and (2,1) form an L of size?",
    "choices": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correct": 1
  },
  {
    "grid": "L...|LL..|....|....",
    "prompt": "Cells (1,1), (2,1), (2,2) form an L of size 3. Which arm goes which direction?",
    "choices": [
      "Vertical down",
      "Horizontal right",
      "Both arms present",
      "Diagonal"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SashiganeMiniSettings): SashiganeMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SashiganeMiniState, action: SashiganeMiniAction): SashiganeMiniState {
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
export function isTerminal(state: SashiganeMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
