import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface PalindromeSudokuSettings { dummy: boolean; }
export interface PalindromeSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type PalindromeSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "5...|....|....|...?",
    "prompt": "Palindrome line from (1,1) to (4,4). (1,1)=5. (4,4) must be?",
    "choices": [
      "5",
      "4",
      "3",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "....|.7..|....|....",
    "prompt": "Palindrome line: cell A = cell B by mirror. A=7. B=?",
    "choices": [
      "1",
      "7",
      "8",
      "9"
    ],
    "correct": 1
  },
  {
    "grid": "1...|....|....|...?",
    "prompt": "Palindrome length 4 starts with 1. Last cell?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "..3.|....|....|.3..",
    "prompt": "Palindrome connects two 3s diagonally. Center cell value?",
    "choices": [
      "3",
      "any",
      "determined by row",
      "cannot tell"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Palindrome of length 5 has middle pair with itself. Middle cell can be?",
    "choices": [
      "any 1-9",
      "odd only",
      "even only",
      "1 only"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Palindrome of length 6: which positions must equal each other?",
    "choices": [
      "1=6,2=5,3=4",
      "1=2,3=4,5=6",
      "all equal",
      "none"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: PalindromeSudokuSettings): PalindromeSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: PalindromeSudokuState, action: PalindromeSudokuAction): PalindromeSudokuState {
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
export function isTerminal(state: PalindromeSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
