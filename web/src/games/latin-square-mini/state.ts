import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface LatinSquareMiniSettings { dummy: boolean; }
export interface LatinSquareMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type LatinSquareMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "12.|...|...",
    "prompt": "3x3 Latin square row 1 = 1,2,?. Last cell?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "1.3|3..|.3.",
    "prompt": "Cell (2,2) in this 3x3 Latin square: column 2 has ? row 2 has 3 already. (2,2) must be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "1234|....|....|....",
    "prompt": "Row 1 = 1234. Cell (2,1) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "How many symbols in an N=4 Latin square?",
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
    "prompt": "Sudoku is a Latin square + which extra constraint?",
    "choices": [
      "diagonal",
      "box",
      "palindrome",
      "none"
    ],
    "correct": 1
  },
  {
    "grid": "12.|2..|...",
    "prompt": "(1,3): row already has 1,2. (1,3) must be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: LatinSquareMiniSettings): LatinSquareMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: LatinSquareMiniState, action: LatinSquareMiniAction): LatinSquareMiniState {
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
export function isTerminal(state: LatinSquareMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
