import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface XSudokuMiniSettings { dummy: boolean; }
export interface XSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type XSudokuMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1...|....|....|....",
    "prompt": "Main diagonal already shows 1. Cell (4,4) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "....|.2..|....|....",
    "prompt": "Main diagonal contains (2,2)=2. (3,3) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "...3|....|....|....",
    "prompt": "Anti-diagonal at (1,4)=3. (4,1) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|.3..|....",
    "prompt": "Anti-diagonal cell (3,2)=3. Anti-diagonal is (1,4),(2,3),(3,2),(4,1). (4,1) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "1234|....|....|....",
    "prompt": "Main diagonal = (1,1),(2,2),(3,3),(4,4). (1,1)=1. Diagonal cells must include 1, so (4,4) is?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 3
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Both diagonals share (in 4x4) which cell?",
    "choices": [
      "none",
      "center two cells",
      "(2,2) only",
      "(2,2) and (3,3)"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: XSudokuMiniSettings): XSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: XSudokuMiniState, action: XSudokuMiniAction): XSudokuMiniState {
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
export function isTerminal(state: XSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
