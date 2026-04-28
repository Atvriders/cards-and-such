import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface AntiKnightSudokuMiniSettings { dummy: boolean; }
export interface AntiKnightSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type AntiKnightSudokuMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1...|....|....|....",
    "prompt": "Knight from (1,1) attacks (2,3) and (3,2). Cell (3,2) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "..1.|....|....|....",
    "prompt": "Knight from (1,3) attacks (3,2) and (3,4). Cell (3,4) cannot be 1, so try?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|2...|....|....",
    "prompt": "Knight (2,1) attacks (4,2). Cell (4,2) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|...3|....|....",
    "prompt": "Knight (2,4) attacks (4,3). What value is forbidden in (4,3)?",
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
    "prompt": "Knight (3,2) attacks (1,1) and (1,3). Cell (1,3) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 3
  },
  {
    "grid": "1...|....|..1.|....",
    "prompt": "Two 1s are knight-aligned: yes/no — answer 'no' means this is illegal placement.",
    "choices": [
      "legal",
      "illegal",
      "unknown",
      "both"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: AntiKnightSudokuMiniSettings): AntiKnightSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: AntiKnightSudokuMiniState, action: AntiKnightSudokuMiniAction): AntiKnightSudokuMiniState {
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
export function isTerminal(state: AntiKnightSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
