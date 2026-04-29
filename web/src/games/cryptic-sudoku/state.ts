import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface CrypticSudokuSettings { dummy: boolean; }
export interface CrypticSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type CrypticSudokuStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "letters spell SUM=4+5+8 — S=?",
    "prompt": "S decodes to?",
    "choices": [
      "6",
      "4",
      "2",
      "8"
    ],
    "correct": 0
  },
  {
    "grid": "mapping P=2, U=?, Z=4 — row 5 needs?",
    "prompt": "U=?",
    "choices": [
      "3",
      "1",
      "5",
      "7"
    ],
    "correct": 0
  },
  {
    "grid": "E appears row 1 col 3 — row already has 1,3,5",
    "prompt": "E=?",
    "choices": [
      "7",
      "2",
      "9",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "letter A appears 3 times forming triple — A constrained to?",
    "prompt": "A=?",
    "choices": [
      "8",
      "2",
      "5",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "LOG decodes to 7,2,9 — L=?",
    "prompt": "L=?",
    "choices": [
      "7",
      "2",
      "9",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "theme word FOUR — F=?",
    "prompt": "F=?",
    "choices": [
      "4",
      "6",
      "2",
      "8"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: CrypticSudokuSettings): CrypticSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: CrypticSudokuState, action: CrypticSudokuStateAction): CrypticSudokuState {
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
export function isTerminal(state: CrypticSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
