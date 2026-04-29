import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface CorralMiniSettings { dummy: boolean; }
export interface CorralMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type CorralMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|.5..|....|....",
    "prompt": "Clue 5 at (2,2) in 4x4 grid. Means 5 visible cells in cross. Max possible visibility?",
    "choices": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correct": 3
  },
  {
    "grid": "....|.3..|....|....",
    "prompt": "Clue 3 at (2,2). Means 3 visible cells (counting self). Loop wall at?",
    "choices": [
      "adj cell",
      "2 cells away",
      "3 cells away",
      "anywhere"
    ],
    "correct": 0
  },
  {
    "grid": "1...|....|....|....",
    "prompt": "Clue 1 at (1,1). Means only itself visible. Loop walls at?",
    "choices": [
      "(1,2) and (2,1)",
      "(1,2) only",
      "(2,1) only",
      "(2,2) only"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|...7",
    "prompt": "Clue 7 at (4,4) in 4x4 grid. Visible cells = 4 left + 3 up + 1 self = ?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 1
  },
  {
    "grid": "L...|L...|L...|L...",
    "prompt": "Loop boundary on column 1. Visibility from (1,2) to right is 3 cells (cols 2,3,4) + self = ?",
    "choices": [
      "3",
      "4",
      "5",
      "1"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "All cells inside loop with no walls. Visibility from corner (1,1) in 4x4?",
    "choices": [
      "4 right + 4 down -1 = 7",
      "8",
      "16",
      "4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: CorralMiniSettings): CorralMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: CorralMiniState, action: CorralMiniAction): CorralMiniState {
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
export function isTerminal(state: CorralMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
