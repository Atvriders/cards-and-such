import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface FlowerSudokuMiniSettings { dummy: boolean; }
export interface FlowerSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type FlowerSudokuMiniStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "NW shared corner — petal NW says 3, center says 1 — conflict",
    "prompt": "Pick the value satisfying both.",
    "choices": [
      "2",
      "3",
      "1",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "NE petal shares corner — known: 2, ? — pick",
    "prompt": "Pick.",
    "choices": [
      "4",
      "2",
      "1",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "SW petal shares — center forces digit",
    "prompt": "Pick.",
    "choices": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "SE petal shares — petal forces digit",
    "prompt": "Pick.",
    "choices": [
      "1",
      "4",
      "2",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "central cell forced by all four petals",
    "prompt": "Pick.",
    "choices": [
      "3",
      "2",
      "4",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "last empty corner cell",
    "prompt": "Pick.",
    "choices": [
      "4",
      "1",
      "2",
      "3"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: FlowerSudokuMiniSettings): FlowerSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: FlowerSudokuMiniState, action: FlowerSudokuMiniStateAction): FlowerSudokuMiniState {
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
export function isTerminal(state: FlowerSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
