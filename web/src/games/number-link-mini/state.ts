import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface NumberLinkMiniSettings { dummy: boolean; }
export interface NumberLinkMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type NumberLinkMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1..1|....|....|....",
    "prompt": "Two 1s on the same row, 3 cells apart. Path connects through cells of which chain?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "1...|....|....|...1",
    "prompt": "Connect (1,1) to (4,4). Number of cells used (including endpoints)?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 1
  },
  {
    "grid": "1.1.|....|....|....",
    "prompt": "Two 1s in same row, gap of 1. Path uses how many extra cells?",
    "choices": [
      "1",
      "2",
      "3",
      "0"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Can paths cross in Number Link?",
    "choices": [
      "yes",
      "no",
      "only at endpoints",
      "sometimes"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Number Link requires every cell be covered. True?",
    "choices": [
      "true (strict)",
      "false",
      "only sometimes",
      "only edges"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Are paths orthogonal or diagonal?",
    "choices": [
      "orthogonal only",
      "diagonal only",
      "both",
      "neither"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: NumberLinkMiniSettings): NumberLinkMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: NumberLinkMiniState, action: NumberLinkMiniAction): NumberLinkMiniState {
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
export function isTerminal(state: NumberLinkMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
