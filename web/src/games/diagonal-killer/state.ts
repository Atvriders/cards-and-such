import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface DiagonalKillerSettings { dummy: boolean; }
export interface DiagonalKillerState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type DiagonalKillerStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "main diagonal needs 5 — cage forces 5 at (5,5)",
    "prompt": "Pick.",
    "choices": [
      "5",
      "2",
      "9",
      "6"
    ],
    "correct": 0
  },
  {
    "grid": "anti-diagonal has 1,2,3,...,8 — needs 9",
    "prompt": "Cell value?",
    "choices": [
      "9",
      "1",
      "5",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "cage sum on diagonal = 15, two cells of cage are 4,2",
    "prompt": "Diagonal cell value?",
    "choices": [
      "9",
      "3",
      "6",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "X-constraint forces unique digit at corner",
    "prompt": "Pick.",
    "choices": [
      "7",
      "1",
      "3",
      "9"
    ],
    "correct": 0
  },
  {
    "grid": "both diagonals intersect at (5,5)",
    "prompt": "Center cell?",
    "choices": [
      "5",
      "1",
      "9",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "cage sum=20 with diagonal cell — others=4,8",
    "prompt": "Pick.",
    "choices": [
      "8",
      "6",
      "2",
      "4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: DiagonalKillerSettings): DiagonalKillerState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: DiagonalKillerState, action: DiagonalKillerStateAction): DiagonalKillerState {
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
export function isTerminal(state: DiagonalKillerState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
