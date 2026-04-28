import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface LittleKillerSudokuSettings { dummy: boolean; }
export interface LittleKillerSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type LittleKillerSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal of length 2 sums to 3. Possible digit pairs?",
    "choices": [
      "1+2",
      "3+0",
      "2+1 only",
      "1+1+1"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal length 2, sum 17. Digits must be?",
    "choices": [
      "8 and 9",
      "7 and 9",
      "9 and 9",
      "6 and 8"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal length 3, sum 6, no repeats: digits?",
    "choices": [
      "1,2,3",
      "2,2,2",
      "1,1,4",
      "1,3,4"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal length 4 sum 10 with repeats allowed. Average is?",
    "choices": [
      "1.5",
      "2.5",
      "3",
      "2"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal length 2 sum 18. Cell digits are?",
    "choices": [
      "9,9",
      "8,9",
      "7,11",
      "9 only"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal length 3 sum 24, repeats allowed. One value forced is?",
    "choices": [
      "7",
      "8",
      "9",
      "at least one 8"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: LittleKillerSudokuSettings): LittleKillerSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: LittleKillerSudokuState, action: LittleKillerSudokuAction): LittleKillerSudokuState {
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
export function isTerminal(state: LittleKillerSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
