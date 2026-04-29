import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface HashiMiniSettings { dummy: boolean; }
export interface HashiMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type HashiMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1.1.|....|....|....",
    "prompt": "Two islands clue 1 each. Bridges between?",
    "choices": [
      "1 single bridge",
      "2 parallel bridges",
      "0 bridges",
      "3 bridges"
    ],
    "correct": 0
  },
  {
    "grid": "2.2.|....|....|....",
    "prompt": "Two islands clue 2 each. Bridges between?",
    "choices": [
      "1 single",
      "2 parallel",
      "3 bridges",
      "0 bridges"
    ],
    "correct": 1
  },
  {
    "grid": "1...|....|....|....1",
    "prompt": "Two islands far apart, each clue 1. How many bridges in puzzle?",
    "choices": [
      "0, no neighbors",
      "1",
      "2",
      "Cannot tell"
    ],
    "correct": 1
  },
  {
    "grid": "3...|....|....|....",
    "prompt": "Single corner island clue 3 in 4x4. Possible?",
    "choices": [
      "Yes, with 2 neighbors",
      "No, no neighbors",
      "Yes, with 3 neighbors",
      "Yes, with 4 neighbors"
    ],
    "correct": 0
  },
  {
    "grid": "2.2.|....|2.2.|....",
    "prompt": "Four islands at corners of 3x3, all clue 2. Bridge total?",
    "choices": [
      "3",
      "4",
      "5",
      "8"
    ],
    "correct": 1
  },
  {
    "grid": "1.1.|....|....|....",
    "prompt": "Bridges allowed to cross other bridges?",
    "choices": [
      "Yes",
      "No, never cross",
      "Only doubles",
      "Only on edges"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: HashiMiniSettings): HashiMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: HashiMiniState, action: HashiMiniAction): HashiMiniState {
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
export function isTerminal(state: HashiMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
