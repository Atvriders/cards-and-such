import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface MiracleSudokuMiniSettings { dummy: boolean; }
export interface MiracleSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type MiracleSudokuMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1...|....|....|....",
    "prompt": "Anti-king + anti-knight: which digit fits the center-marked cell at row 2, col 2?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 3
  },
  {
    "grid": "..3.|....|....|2...",
    "prompt": "With knight + king constraints, what digit goes in row 1 col 1?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "....|.2..|....|....",
    "prompt": "Row 1 col 1 cannot match the 2 by knight move. Which digit is allowed?",
    "choices": [
      "2",
      "1",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "4...|....|....|...1",
    "prompt": "Anti-king blocks digit 4 in row 1 col 2. The cell needs which value?",
    "choices": [
      "4",
      "3",
      "2",
      "1"
    ],
    "correct": 2
  },
  {
    "grid": "....|..3.|....|....",
    "prompt": "Knight from (2,3) attacks (4,4). Row 4 col 4 cannot be 3, so legal value is?",
    "choices": [
      "3",
      "2",
      "4",
      "1"
    ],
    "correct": 2
  },
  {
    "grid": "1...|....|...4|....",
    "prompt": "Row 1 has a 1 already. Cell row 1 col 4 must be?",
    "choices": [
      "1",
      "4",
      "2",
      "3"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: MiracleSudokuMiniSettings): MiracleSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: MiracleSudokuMiniState, action: MiracleSudokuMiniAction): MiracleSudokuMiniState {
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
export function isTerminal(state: MiracleSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
