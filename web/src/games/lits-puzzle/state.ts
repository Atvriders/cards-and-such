import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface LitsPuzzleSettings { dummy: boolean; }
export interface LitsPuzzleState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type LitsPuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Each region holds how many shaded cells in LITS?",
    "choices": [
      "3",
      "4",
      "5",
      "variable"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two L-tetrominoes touching edge-to-edge across regions: legal?",
    "choices": [
      "yes",
      "no",
      "only at corners",
      "only if smaller"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal touch between two same-type tetrominoes: legal?",
    "choices": [
      "yes",
      "no",
      "sometimes",
      "only L-shapes"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A 2x2 fully shaded block is allowed?",
    "choices": [
      "yes",
      "no",
      "only at edges",
      "only with I-shape"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "All shaded cells must be connected as one blob. True?",
    "choices": [
      "true",
      "false",
      "only by region",
      "only by row"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Which letter does NOT appear in LITS tetromino names?",
    "choices": [
      "L",
      "I",
      "T",
      "O"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: LitsPuzzleSettings): LitsPuzzleState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: LitsPuzzleState, action: LitsPuzzleAction): LitsPuzzleState {
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
export function isTerminal(state: LitsPuzzleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
