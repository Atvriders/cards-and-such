import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface SkyscraperSudokuSettings { dummy: boolean; }
export interface SkyscraperSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SkyscraperSudokuStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "edge clue 1 means tallest first — col=9,?,?",
    "prompt": "Cell (1,col)?",
    "choices": [
      "9",
      "1",
      "5",
      "7"
    ],
    "correct": 0
  },
  {
    "grid": "clue 9 forces ascending — first cell?",
    "prompt": "Pick.",
    "choices": [
      "1",
      "9",
      "5",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "clue 2 — first two cells must include 9",
    "prompt": "Cell 2?",
    "choices": [
      "9",
      "1",
      "2",
      "5"
    ],
    "correct": 0
  },
  {
    "grid": "clue 3 from right means three visible from right",
    "prompt": "Right cell?",
    "choices": [
      "9",
      "8",
      "7",
      "6"
    ],
    "correct": 0
  },
  {
    "grid": "clue 4 with 9 in row middle",
    "prompt": "Cell value?",
    "choices": [
      "9",
      "8",
      "7",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "clue 5 ascending pattern",
    "prompt": "Mid cell?",
    "choices": [
      "5",
      "1",
      "9",
      "3"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SkyscraperSudokuSettings): SkyscraperSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SkyscraperSudokuState, action: SkyscraperSudokuStateAction): SkyscraperSudokuState {
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
export function isTerminal(state: SkyscraperSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
