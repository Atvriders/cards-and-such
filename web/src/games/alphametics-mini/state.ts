import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface AlphameticsMiniSettings { dummy: boolean; }
export interface AlphameticsMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type AlphameticsMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "AB+B|=CC.|....|....",
    "prompt": "AB + B = CC. What is B?",
    "choices": [
      "1",
      "2",
      "3",
      "9"
    ],
    "correct": 3
  },
  {
    "grid": "A+A.|=B..|....|....",
    "prompt": "A + A = B (single-digit). If A=4, B=?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 2
  },
  {
    "grid": "AA+A|=BB.|....|....",
    "prompt": "AA + A = BB. What is A?",
    "choices": [
      "1",
      "2",
      "9",
      "5"
    ],
    "correct": 2
  },
  {
    "grid": "A*A.|=AA.|....|....",
    "prompt": "A × A = AA (two-digit, both same). A=?",
    "choices": [
      "1",
      "5",
      "6",
      "9"
    ],
    "correct": 0
  },
  {
    "grid": "AB+A|=BA.|....|....",
    "prompt": "AB + A = BA (two-digit). With A=1, B=?",
    "choices": [
      "8",
      "9",
      "0",
      "5"
    ],
    "correct": 1
  },
  {
    "grid": "A+B.|=10.|....|....",
    "prompt": "A + B = 10 (two distinct digits). If A=3, B=?",
    "choices": [
      "7",
      "8",
      "5",
      "6"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: AlphameticsMiniSettings): AlphameticsMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: AlphameticsMiniState, action: AlphameticsMiniAction): AlphameticsMiniState {
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
export function isTerminal(state: AlphameticsMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
