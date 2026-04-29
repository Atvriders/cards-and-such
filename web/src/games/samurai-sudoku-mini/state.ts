import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface SamuraiSudokuMiniSettings { dummy: boolean; }
export interface SamuraiSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SamuraiSudokuMiniStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "12..|34..|..3.|..12",
    "prompt": "Top grid: row 1 has 1,2 then ?, ?. The third cell in row 1 must be?",
    "choices": [
      "3",
      "4",
      "1",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "1.34|.4.2|3.1.|.213",
    "prompt": "What digit goes in row 2 column 1?",
    "choices": [
      "4",
      "2",
      "3",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "..12|.13.|2.4.|3.21",
    "prompt": "The center cell of corner box (row 2 col 2) must be?",
    "choices": [
      "1",
      "3",
      "2",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "1.2.|.3.4|2.1.|.4.3",
    "prompt": "Cell (row 1 col 2) — only one digit fits. Pick.",
    "choices": [
      "4",
      "1",
      "2",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "12.4|34.2|..3.|.1.3",
    "prompt": "Shared cell at corner — what value satisfies both grids?",
    "choices": [
      "1",
      "3",
      "2",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "1234|3412|.143|41.2",
    "prompt": "Cell (row 4 col 3) needs?",
    "choices": [
      "2",
      "3",
      "1",
      "4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SamuraiSudokuMiniSettings): SamuraiSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SamuraiSudokuMiniState, action: SamuraiSudokuMiniStateAction): SamuraiSudokuMiniState {
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
export function isTerminal(state: SamuraiSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
