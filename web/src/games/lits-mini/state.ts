import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface LitsMiniSettings { dummy: boolean; }
export interface LitsMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type LitsMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "L...|L...|L...|LL..",
    "prompt": "Shape covers (1,1),(2,1),(3,1),(4,1),(4,2) — that's 5 cells. Valid tetromino?",
    "choices": [
      "Yes, L-tetromino",
      "No, only 4-cell allowed",
      "Yes, I-tetromino",
      "Yes, S-tetromino"
    ],
    "correct": 1
  },
  {
    "grid": "LLL.|.L..|....|....",
    "prompt": "Shape covers (1,1),(1,2),(1,3),(2,2) — 4 cells. Which tetromino?",
    "choices": [
      "L",
      "I",
      "T",
      "S"
    ],
    "correct": 2
  },
  {
    "grid": "LLLL|....|....|....",
    "prompt": "Shape covers (1,1)-(1,4) — 4 cells in a row. Which tetromino?",
    "choices": [
      "L",
      "I",
      "T",
      "S"
    ],
    "correct": 1
  },
  {
    "grid": "LL..|.LL.|....|....",
    "prompt": "Shape covers (1,1),(1,2),(2,2),(2,3). Which tetromino?",
    "choices": [
      "L",
      "I",
      "T",
      "S"
    ],
    "correct": 3
  },
  {
    "grid": "LLLL|LLLL|....|....",
    "prompt": "8-cell region with 2x2 shaded block. Allowed in LITS?",
    "choices": [
      "Yes always",
      "No, 2x2 forbidden",
      "Only as O",
      "Only at edges"
    ],
    "correct": 1
  },
  {
    "grid": "L...|LL..|.L..|....",
    "prompt": "Shape covers (1,1),(2,1),(2,2),(3,2) — 4 cells. Which tetromino?",
    "choices": [
      "L",
      "I",
      "T",
      "S"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: LitsMiniSettings): LitsMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: LitsMiniState, action: LitsMiniAction): LitsMiniState {
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
export function isTerminal(state: LitsMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
