import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface SnakeLogicSettings { dummy: boolean; }
export interface SnakeLogicState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SnakeLogicAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "H...|....|....|...T",
    "prompt": "Snake from H at (1,1) to T at (4,4). Min path length (cells)?",
    "choices": [
      "4",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "grid": "H...|S...|S...|S..T",
    "prompt": "Snake column 1 then row 4. Cells: 4 + 3 = 7. Cell (1,1) to (4,4) covers length?",
    "choices": [
      "6",
      "7",
      "8",
      "10"
    ],
    "correct": 1
  },
  {
    "grid": "H1..|....|....|....",
    "prompt": "Head at (1,1), clue 1 at (1,2). Adj snake cells = 1. Means snake passes adjacent how?",
    "choices": [
      "Once",
      "Twice",
      "Never",
      "Three times"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Snake must not be adjacent to itself except at path. In 4x4 grid, max snake length?",
    "choices": [
      "8",
      "10",
      "12",
      "16"
    ],
    "correct": 3
  },
  {
    "grid": "H..T|....|....|....",
    "prompt": "Head and tail in same row. Min path between?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|H..T",
    "prompt": "Head at (4,1) and Tail at (4,4) in same row. Min snake length?",
    "choices": [
      "4",
      "3",
      "5",
      "6"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SnakeLogicSettings): SnakeLogicState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SnakeLogicState, action: SnakeLogicAction): SnakeLogicState {
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
export function isTerminal(state: SnakeLogicState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
