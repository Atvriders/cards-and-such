import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface CountryRoadMiniSettings { dummy: boolean; }
export interface CountryRoadMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type CountryRoadMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "L...|L...|L...|L...",
    "prompt": "Loop fills column 1 (rows 1-4). Closed loop must turn somewhere. Minimum number of regions visited?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "LL..|.L..|.LL.|...L",
    "prompt": "Loop visits 7 cells. Closed loops must have ___ cells minimum?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "In a 4x4 grid, the smallest closed loop has how many cells?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 2
  },
  {
    "grid": "LLLL|L..L|L..L|LLLL",
    "prompt": "Outer loop on a 4x4 grid uses how many cells?",
    "choices": [
      "8",
      "10",
      "12",
      "16"
    ],
    "correct": 2
  },
  {
    "grid": "L.L.|....|....|....",
    "prompt": "Two separate loop segments in row 1 — is this a valid single loop?",
    "choices": [
      "Yes",
      "No, must be connected",
      "Only if same color",
      "Only if same region"
    ],
    "correct": 1
  },
  {
    "grid": "....|.LL.|.LL.|....",
    "prompt": "2x2 block in middle — does this form a valid closed loop?",
    "choices": [
      "Yes",
      "No, loop must run on edges",
      "Only at borders",
      "Always"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: CountryRoadMiniSettings): CountryRoadMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: CountryRoadMiniState, action: CountryRoadMiniAction): CountryRoadMiniState {
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
export function isTerminal(state: CountryRoadMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
