import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface CrossSudokuMiniSettings { dummy: boolean; }
export interface CrossSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type CrossSudokuMiniStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "center NW shared with left grid SE",
    "prompt": "Left says 2, center says ? — pick.",
    "choices": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "top arm N shared with center N",
    "prompt": "Both grids constrain — pick.",
    "choices": [
      "2",
      "4",
      "1",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "right arm shares cell — left says 1",
    "prompt": "Right grid forces digit. Pick.",
    "choices": [
      "4",
      "2",
      "3",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "bottom arm SE shares with center SE",
    "prompt": "Both grids agree on?",
    "choices": [
      "1",
      "3",
      "2",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "four arms agree only on one digit",
    "prompt": "Pick.",
    "choices": [
      "3",
      "4",
      "2",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "center cell is sum of arms",
    "prompt": "Pick.",
    "choices": [
      "2",
      "1",
      "4",
      "3"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: CrossSudokuMiniSettings): CrossSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: CrossSudokuMiniState, action: CrossSudokuMiniStateAction): CrossSudokuMiniState {
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
export function isTerminal(state: CrossSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
