import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface SurplusSudokuSettings { dummy: boolean; }
export interface SurplusSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SurplusSudokuStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "row 5 has 1,2,3,4,5,6,7,8 — needs 9",
    "prompt": "Cell (5,9)?",
    "choices": [
      "9",
      "1",
      "5",
      "7"
    ],
    "correct": 0
  },
  {
    "grid": "col 3 has 1,2,4,5,6,7,8,9 — needs 3",
    "prompt": "Pick.",
    "choices": [
      "3",
      "8",
      "2",
      "6"
    ],
    "correct": 0
  },
  {
    "grid": "box (2,2) has all but 5",
    "prompt": "Cell value?",
    "choices": [
      "5",
      "1",
      "7",
      "9"
    ],
    "correct": 0
  },
  {
    "grid": "row+col intersect already pin",
    "prompt": "Pick.",
    "choices": [
      "4",
      "2",
      "8",
      "6"
    ],
    "correct": 0
  },
  {
    "grid": "surplus given pinpoints (3,7)",
    "prompt": "Pick.",
    "choices": [
      "6",
      "2",
      "8",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "last single empty cell of grid",
    "prompt": "Pick.",
    "choices": [
      "7",
      "3",
      "9",
      "5"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SurplusSudokuSettings): SurplusSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SurplusSudokuState, action: SurplusSudokuStateAction): SurplusSudokuState {
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
export function isTerminal(state: SurplusSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
