import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface MagicSquareQuizSettings { dummy: boolean; }
export interface MagicSquareQuizState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type MagicSquareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Magic constant for a 3x3 magic square using 1-9?",
    "choices": [
      "12",
      "15",
      "18",
      "21"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Magic constant for a 4x4 magic square using 1-16?",
    "choices": [
      "30",
      "34",
      "36",
      "40"
    ],
    "correct": 1
  },
  {
    "grid": "294|.5.|...",
    "prompt": "Lo Shu 3x3 — center cell is always?",
    "choices": [
      "1",
      "5",
      "9",
      "7"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "5x5 magic constant using 1-25?",
    "choices": [
      "55",
      "60",
      "65",
      "70"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "How many distinct 3x3 magic squares using 1-9 (ignoring rotations/reflections)?",
    "choices": [
      "1",
      "2",
      "4",
      "8"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Sum of all numbers 1-9?",
    "choices": [
      "36",
      "42",
      "45",
      "50"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: MagicSquareQuizSettings): MagicSquareQuizState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: MagicSquareQuizState, action: MagicSquareQuizAction): MagicSquareQuizState {
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
export function isTerminal(state: MagicSquareQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
