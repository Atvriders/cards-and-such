import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface NonConsecutiveSudokuSettings { dummy: boolean; }
export interface NonConsecutiveSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type NonConsecutiveSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "2...|....|....|....",
    "prompt": "Cell (1,2) is orthogonal to 2; cannot be 1 or 3. Legal pick?",
    "choices": [
      "1",
      "3",
      "4",
      "2"
    ],
    "correct": 2
  },
  {
    "grid": "....|2...|....|....",
    "prompt": "Cell (1,1) is adjacent to (2,1)=2. Forbidden values at (1,1)?",
    "choices": [
      "1 and 3",
      "2 and 4",
      "2 only",
      "none"
    ],
    "correct": 0
  },
  {
    "grid": "1234|....|....|....",
    "prompt": "Cell (2,1) below the 1 cannot be 2. Allowed values?",
    "choices": [
      "2 only",
      "3 or 4",
      "1, 3, 4",
      "1 or 4"
    ],
    "correct": 1
  },
  {
    "grid": "....|.3..|....|....",
    "prompt": "Cell (2,3) is right-adjacent to a 3. Forbidden values at (2,3)?",
    "choices": [
      "3 and 4",
      "2 and 4",
      "2 and 3",
      "none"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|4321",
    "prompt": "Cell (3,1) above the 4 cannot be 3 or 5 (no 5 here). Forbidden?",
    "choices": [
      "3",
      "5",
      "both",
      "none"
    ],
    "correct": 0
  },
  {
    "grid": "..2.|....|....|....",
    "prompt": "Cell (1,4) right of (1,3)=2 cannot be?",
    "choices": [
      "1 or 3",
      "2",
      "4",
      "none"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: NonConsecutiveSudokuSettings): NonConsecutiveSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: NonConsecutiveSudokuState, action: NonConsecutiveSudokuAction): NonConsecutiveSudokuState {
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
export function isTerminal(state: NonConsecutiveSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
