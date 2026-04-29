import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface GalaxiesMiniSettings { dummy: boolean; }
export interface GalaxiesMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type GalaxiesMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|.S..|....|....",
    "prompt": "Star at (2,2). A region of size 3 — where can the third cell be?",
    "choices": [
      "Symmetric pair of (1,2) is (3,2)",
      "(1,1)",
      "(4,4)",
      "Only adjacent"
    ],
    "correct": 0
  },
  {
    "grid": "....|..S.|....|....",
    "prompt": "Star at (2,3). For region size 5, two cells at (2,2), (2,4) means region includes?",
    "choices": [
      "Symmetric across star",
      "Random",
      "Only diagonal",
      "Cannot have size 5"
    ],
    "correct": 0
  },
  {
    "grid": "S...|....|....|...S",
    "prompt": "Two stars at corners. Galaxies must be rotationally symmetric around each star. Possible?",
    "choices": [
      "Yes always",
      "Only single-cell regions",
      "No, conflict",
      "Only with 3rd star"
    ],
    "correct": 0
  },
  {
    "grid": "....|.S..|.S..|....",
    "prompt": "Two stars stacked at (2,2) and (3,2). Region split between them?",
    "choices": [
      "Yes, vertical separation",
      "No, must merge",
      "Only diagonal",
      "Cannot solve"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|..S.|....",
    "prompt": "Star at (3,3) — region of size 1 means region is just?",
    "choices": [
      "Single cell at star",
      "Cell + symmetric pair",
      "Whole row",
      "Whole column"
    ],
    "correct": 0
  },
  {
    "grid": "....|.SS.|....|....",
    "prompt": "Two stars adjacent at (2,2) and (2,3). Each needs symmetric region — possible?",
    "choices": [
      "Yes, separate galaxies",
      "No, must merge",
      "Only if same size",
      "Only at center"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: GalaxiesMiniSettings): GalaxiesMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: GalaxiesMiniState, action: GalaxiesMiniAction): GalaxiesMiniState {
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
export function isTerminal(state: GalaxiesMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
