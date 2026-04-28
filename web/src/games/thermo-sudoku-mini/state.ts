import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface ThermoSudokuMiniSettings { dummy: boolean; }
export interface ThermoSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type ThermoSudokuMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "T1..|T...|....|....",
    "prompt": "A 2-cell thermometer with bulb 1 at top. Tail must be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "1...|2...|3...|....",
    "prompt": "Continuing the increasing thermometer in column 1, the bottom value is?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 3
  },
  {
    "grid": "....|.2..|.3..|.4..",
    "prompt": "Bulb at row 2 col 2 reads 2; the column thermo strictly increases. Row 1 col 2 must be?",
    "choices": [
      "1",
      "3",
      "2",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "4...|3...|2...|....",
    "prompt": "Thermometer increases bottom-up in col 1. Bottom cell must be?",
    "choices": [
      "1",
      "4",
      "2",
      "3"
    ],
    "correct": 1
  },
  {
    "grid": "..1.|..2.|..3.|....",
    "prompt": "Strictly increasing thermometer in col 3. Row 4 col 3 is?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 3
  },
  {
    "grid": "T...|.T..|..T.|...T",
    "prompt": "Diagonal thermo bulb top-left = 1. Diagonal cells must be?",
    "choices": [
      "1,1,1,1",
      "1,2,3,4",
      "4,3,2,1",
      "2,3,4,1"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: ThermoSudokuMiniSettings): ThermoSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: ThermoSudokuMiniState, action: ThermoSudokuMiniAction): ThermoSudokuMiniState {
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
export function isTerminal(state: ThermoSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
