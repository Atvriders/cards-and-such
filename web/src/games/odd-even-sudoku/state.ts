import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface OddEvenSudokuSettings { dummy: boolean; }
export interface OddEvenSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type OddEvenSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "A gray (odd) cell — which value is legal?",
    "choices": [
      "2",
      "4",
      "6",
      "7"
    ],
    "correct": 3
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A white (even) cell — which value is legal?",
    "choices": [
      "1",
      "2",
      "5",
      "9"
    ],
    "correct": 1
  },
  {
    "grid": "1...|....|....|....",
    "prompt": "Row 1 col 2 is gray (odd). Row 1 has 1. Legal?",
    "choices": [
      "1",
      "3",
      "2",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|.4..|....|....",
    "prompt": "Row 2 col 3 is white (even). Row already has 4. Legal pick?",
    "choices": [
      "3",
      "5",
      "2",
      "8"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "An even cell allows how many digits in 1-9?",
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
    "prompt": "An odd cell allows how many digits in 1-9?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: OddEvenSudokuSettings): OddEvenSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: OddEvenSudokuState, action: OddEvenSudokuAction): OddEvenSudokuState {
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
export function isTerminal(state: OddEvenSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
