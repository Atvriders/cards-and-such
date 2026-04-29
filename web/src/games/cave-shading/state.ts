import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface CaveShadingSettings { dummy: boolean; }
export interface CaveShadingState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type CaveShadingAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "X...|X...|X...|X...",
    "prompt": "Four cells in column 1 form which tetromino?",
    "choices": [
      "L",
      "I",
      "T",
      "S"
    ],
    "correct": 1
  },
  {
    "grid": "X...|XX..|.X..|....",
    "prompt": "Cells (1,1),(2,1),(2,2),(3,2) form which tetromino?",
    "choices": [
      "L",
      "I",
      "T",
      "S"
    ],
    "correct": 3
  },
  {
    "grid": "XX..|XX..|....|....",
    "prompt": "2x2 of shaded cells. Allowed shape?",
    "choices": [
      "O",
      "L",
      "Forbidden in LITS family",
      "T"
    ],
    "correct": 2
  },
  {
    "grid": "XXX.|.X..|....|....",
    "prompt": "Cells (1,1),(1,2),(1,3),(2,2) — which tetromino?",
    "choices": [
      "L",
      "I",
      "T",
      "S"
    ],
    "correct": 2
  },
  {
    "grid": "XX..|X...|X...|....",
    "prompt": "Cells (1,1),(1,2),(2,1),(3,1) — which tetromino?",
    "choices": [
      "L",
      "I",
      "T",
      "S"
    ],
    "correct": 0
  },
  {
    "grid": "X...|X...|X...|XX..",
    "prompt": "Cells (1,1),(2,1),(3,1),(4,1),(4,2) — too many cells. Valid?",
    "choices": [
      "No, 5 cells",
      "Yes, L",
      "Yes, I",
      "Yes, T"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: CaveShadingSettings): CaveShadingState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: CaveShadingState, action: CaveShadingAction): CaveShadingState {
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
export function isTerminal(state: CaveShadingState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
