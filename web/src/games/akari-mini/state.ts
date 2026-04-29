import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface AkariMiniSettings { dummy: boolean; }
export interface AkariMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type AkariMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "B...|....|....|....",
    "prompt": "Black cell at (1,1) with no number. Bulb adjacent constraint?",
    "choices": [
      "Must have bulb",
      "No constraint on bulbs",
      "Forbidden adjacent",
      "Only diagonal bulbs"
    ],
    "correct": 1
  },
  {
    "grid": ".4..|....|....|....",
    "prompt": "Black cell with clue 4. Means how many bulbs adjacent?",
    "choices": [
      "4 (all 4 neighbors)",
      "3",
      "2",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "L.L.|....|....|....",
    "prompt": "Two bulbs in row 1, columns 1 and 3, no black between. Allowed?",
    "choices": [
      "Yes always",
      "No, illuminate each other",
      "Only at edges",
      "Only if same column"
    ],
    "correct": 1
  },
  {
    "grid": "L.B.|....|....|....",
    "prompt": "Bulb at (1,1), black at (1,3). Bulb at (1,4) — illuminate each other?",
    "choices": [
      "Yes, row clear",
      "No, black blocks",
      "Depends on clue",
      "Always blocked"
    ],
    "correct": 1
  },
  {
    "grid": "....|L...|....|....",
    "prompt": "Bulb at (2,1). Cells lit: row 2 and column 1 entirely (no obstacles in 4x4). How many cells lit?",
    "choices": [
      "4 row + 4 col -1 self = 7",
      "8",
      "16",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "B...|.B..|..B.|...B",
    "prompt": "Black cells on diagonal. Bulb at (1,2) — illuminates rest of row?",
    "choices": [
      "Yes until next black",
      "Yes whole row",
      "No, blocked at (1,1)",
      "Only column"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: AkariMiniSettings): AkariMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: AkariMiniState, action: AkariMiniAction): AkariMiniState {
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
export function isTerminal(state: AkariMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
