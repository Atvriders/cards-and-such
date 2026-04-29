import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface QueensPuzzleSettings { dummy: boolean; }
export interface QueensPuzzleState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type QueensPuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "Q...|....|....|....",
    "prompt": "Queen at (1,1). Which cell is safe for next queen?",
    "choices": [
      "(1,2) same row",
      "(2,2) diagonal",
      "(3,3) diagonal",
      "(2,3) safe"
    ],
    "correct": 3
  },
  {
    "grid": ".Q..|....|....|....",
    "prompt": "Queen at (1,2). Safe row for next queen?",
    "choices": [
      "Row 2",
      "Row 1",
      "Any",
      "None"
    ],
    "correct": 0
  },
  {
    "grid": "....|.Q..|....|....",
    "prompt": "Queen at (2,2). Cell (3,3) safe?",
    "choices": [
      "No, diagonal attack",
      "Yes safe",
      "No, row attack",
      "No, column attack"
    ],
    "correct": 0
  },
  {
    "grid": "Q...|..Q.|....|....",
    "prompt": "Queens at (1,1) and (2,3). Cell (3,2) attacked by which?",
    "choices": [
      "By (1,1) diagonal? No. By (2,3) diagonal? Yes",
      "By neither",
      "By (1,1) only",
      "By both"
    ],
    "correct": 0
  },
  {
    "grid": "Q...|..Q.|....|....",
    "prompt": "Queens at (1,1) and (2,3). Cell (4,2) safe?",
    "choices": [
      "Yes",
      "No, attacked by (1,1) diag",
      "No, attacked by (2,3) diag",
      "No, both"
    ],
    "correct": 0
  },
  {
    "grid": ".Q..|...Q|Q...|..Q.",
    "prompt": "4x4 with queens at (1,2),(2,4),(3,1),(4,3). All non-attacking?",
    "choices": [
      "Yes, classic 4-queens",
      "No, two attack",
      "Maybe",
      "Only 3 of 4 valid"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: QueensPuzzleSettings): QueensPuzzleState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: QueensPuzzleState, action: QueensPuzzleAction): QueensPuzzleState {
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
export function isTerminal(state: QueensPuzzleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
