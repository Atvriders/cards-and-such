import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface NumbrixMiniSettings { dummy: boolean; }
export interface NumbrixMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type NumbrixMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1..|...|..9",
    "prompt": "3x3 Numbrix path 1-9 starting top-left and ending bottom-right. Cell (2,2) must be?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "grid": "...|...|...",
    "prompt": "In Numbrix, can numbers 4 and 5 sit on diagonally adjacent cells?",
    "choices": [
      "yes",
      "no",
      "only at corners",
      "only if N is odd"
    ],
    "correct": 1
  },
  {
    "grid": "1..|.2.|...",
    "prompt": "Cell (2,2)=2 sits orthogonally adjacent to 1 at (1,1). True?",
    "choices": [
      "true (orthogonal)",
      "false (diagonal)",
      "sometimes",
      "only in mini"
    ],
    "correct": 1
  },
  {
    "grid": "..1|...|9..",
    "prompt": "Path goes 1 in top-right, 9 in bottom-left. Total cells?",
    "choices": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correct": 2
  },
  {
    "grid": "...|...|...",
    "prompt": "Numbrix differs from Hidato by allowing diagonals?",
    "choices": [
      "true",
      "false (no diagonals in Numbrix)",
      "both allow",
      "neither does"
    ],
    "correct": 1
  },
  {
    "grid": "1.3|...|...",
    "prompt": "In a row 1,?,3 with orthogonal adjacency, the middle cell must be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: NumbrixMiniSettings): NumbrixMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: NumbrixMiniState, action: NumbrixMiniAction): NumbrixMiniState {
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
export function isTerminal(state: NumbrixMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
