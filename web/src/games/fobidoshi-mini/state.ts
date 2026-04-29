import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface FobidoshiMiniSettings { dummy: boolean; }
export interface FobidoshiMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type FobidoshiMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "O...|....|....|....",
    "prompt": "One circle placed at (1,1). Where can a circle from a different region go?",
    "choices": [
      "(1,2) adjacent",
      "(2,1) adjacent",
      "(3,3) far",
      "(1,2) again"
    ],
    "correct": 2
  },
  {
    "grid": ".O..|....|....|....",
    "prompt": "Circle at (1,2). Adjacent cells (1,1), (1,3), (2,2) are forbidden for new region. Pick legal cell:",
    "choices": [
      "(1,1)",
      "(1,3)",
      "(2,2)",
      "(3,3)"
    ],
    "correct": 3
  },
  {
    "grid": "....|..O.|....|....",
    "prompt": "Circle at (2,3). Which cell is NOT adjacent?",
    "choices": [
      "(1,3)",
      "(2,2)",
      "(2,4)",
      "(4,4)"
    ],
    "correct": 3
  },
  {
    "grid": "O...|...O|....|....",
    "prompt": "Circles at (1,1) and (2,4). Pick a cell not adjacent to either:",
    "choices": [
      "(2,1)",
      "(1,4)",
      "(3,3)",
      "(2,3)"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|O...",
    "prompt": "Circle at (4,1). Adjacent cells include?",
    "choices": [
      "(3,1) and (4,2)",
      "(1,4)",
      "(3,3)",
      "(2,2)"
    ],
    "correct": 0
  },
  {
    "grid": ".O.O|....|....|....",
    "prompt": "Circles at (1,2) and (1,4). Both same region OK if rule allows. Different regions — legal?",
    "choices": [
      "Yes always",
      "No, illegal",
      "Only if not neighbors",
      "Only at edges"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: FobidoshiMiniSettings): FobidoshiMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: FobidoshiMiniState, action: FobidoshiMiniAction): FobidoshiMiniState {
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
export function isTerminal(state: FobidoshiMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
