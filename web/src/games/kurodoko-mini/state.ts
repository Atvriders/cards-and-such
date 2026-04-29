import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface KurodokoMiniSettings { dummy: boolean; }
export interface KurodokoMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type KurodokoMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "5...|....|....|....",
    "prompt": "Cell (1,1) shows 5. Cell counts itself + visible whites. Need 4 more visible. Min row width?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "grid": "....|.3..|....|....",
    "prompt": "Cell (2,2) shows 3. Counting itself + neighbors visible. Maximum needed unblocked count?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|..2.|....",
    "prompt": "Cell (3,3) shows 2. Means itself + 1 visible white. Where could black go to enforce?",
    "choices": [
      "(3,2)",
      "(3,1)",
      "(1,3)",
      "(3,3) itself"
    ],
    "correct": 0
  },
  {
    "grid": "1...|....|....|....",
    "prompt": "Cell (1,1) shows 1. Just itself visible. Need black at?",
    "choices": [
      "(1,2) and (2,1)",
      "(1,2) only",
      "(2,1) only",
      "(2,2)"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|...4",
    "prompt": "Cell (4,4) shows 4. In a 4x4 grid, what is max visible from corner?",
    "choices": [
      "3",
      "4",
      "5",
      "7"
    ],
    "correct": 3
  },
  {
    "grid": "....|.B..|....|....",
    "prompt": "Black at (2,2). Can black also be at (2,3)?",
    "choices": [
      "Yes always",
      "No, adjacent black illegal",
      "Only if numbered",
      "Only at edges"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: KurodokoMiniSettings): KurodokoMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: KurodokoMiniState, action: KurodokoMiniAction): KurodokoMiniState {
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
export function isTerminal(state: KurodokoMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
