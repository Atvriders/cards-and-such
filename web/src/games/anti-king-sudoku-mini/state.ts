import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface AntiKingSudokuMiniSettings { dummy: boolean; }
export interface AntiKingSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type AntiKingSudokuMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1...|....|....|....",
    "prompt": "Anti-king: cell (2,2) is diagonally adjacent to (1,1)=1. So (2,2) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": ".2..|....|....|....",
    "prompt": "Cell (2,1) is king-adjacent to (1,2)=2. (2,1) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|.3..|....|....",
    "prompt": "Cell (3,3) diagonally touches (2,2)=3. Forbidden value at (3,3) is?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|.4..|....",
    "prompt": "(3,2) = 4. Which cell of the four candidates can also be 4? Pick the legal one.",
    "choices": [
      "(2,1)",
      "(2,3)",
      "(4,1)",
      "(1,1)"
    ],
    "correct": 3
  },
  {
    "grid": "1.1.|....|....|....",
    "prompt": "Two 1s in row 1 separated by a single cell — anti-king allows them?",
    "choices": [
      "yes",
      "no, king blocks",
      "yes if column unique",
      "no, not adjacent"
    ],
    "correct": 0
  },
  {
    "grid": "....|2..3|....|....",
    "prompt": "Row 2 has 2 and 3. Cell (1,3) is king-adjacent to both. Allowed value?",
    "choices": [
      "2",
      "3",
      "1",
      "4"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: AntiKingSudokuMiniSettings): AntiKingSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: AntiKingSudokuMiniState, action: AntiKingSudokuMiniAction): AntiKingSudokuMiniState {
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
export function isTerminal(state: AntiKingSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
