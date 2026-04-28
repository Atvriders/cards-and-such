import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface BinairoMiniSettings { dummy: boolean; }
export interface BinairoMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type BinairoMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "00..|....|....|....",
    "prompt": "Row starts 0,0. Cell (1,3) cannot be 0 (no three-in-a-row). Pick.",
    "choices": [
      "0",
      "1",
      "2",
      "3"
    ],
    "correct": 1
  },
  {
    "grid": "11..|....|....|....",
    "prompt": "Row starts 1,1. Cell (1,3) must be?",
    "choices": [
      "1",
      "0",
      "2",
      "3"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "In a 4-wide row, total 1s must equal?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "0.1.|....|....|....",
    "prompt": "Row 0,?,1,? — equal count rule means cell 4 is?",
    "choices": [
      "0",
      "1",
      "2",
      "cannot tell"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Three 0s in a row are?",
    "choices": [
      "legal",
      "illegal",
      "only at edges",
      "only if even row"
    ],
    "correct": 1
  },
  {
    "grid": "1..0|....|....|....",
    "prompt": "Row already has one 1 and one 0. Two more cells need?",
    "choices": [
      "1,1",
      "0,0",
      "one of each",
      "cannot determine"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: BinairoMiniSettings): BinairoMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: BinairoMiniState, action: BinairoMiniAction): BinairoMiniState {
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
export function isTerminal(state: BinairoMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
