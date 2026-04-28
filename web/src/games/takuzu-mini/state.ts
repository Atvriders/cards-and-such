import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface TakuzuMiniSettings { dummy: boolean; }
export interface TakuzuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type TakuzuMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Two completed rows in a Takuzu grid look identical. Legal?",
    "choices": [
      "yes",
      "no",
      "only if columns differ",
      "only if 4x4"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Takuzu adds which constraint over Binairo?",
    "choices": [
      "row uniqueness",
      "triple ban",
      "equal count",
      "none"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "In a 4x4 Takuzu, all four rows must be?",
    "choices": [
      "distinct",
      "identical",
      "palindromes",
      "sorted"
    ],
    "correct": 0
  },
  {
    "grid": "0011|....|....|....",
    "prompt": "Row 1 = 0011. Row 2 cannot be?",
    "choices": [
      "1100",
      "0101",
      "0110",
      "0011"
    ],
    "correct": 3
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two identical columns also forbidden in Takuzu?",
    "choices": [
      "yes",
      "no",
      "only middle",
      "only first"
    ],
    "correct": 0
  },
  {
    "grid": "1010|....|....|....",
    "prompt": "Row 1 = 1010. Row 2 may be?",
    "choices": [
      "1010",
      "0101",
      "not 1010",
      "both b and c"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: TakuzuMiniSettings): TakuzuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: TakuzuMiniState, action: TakuzuMiniAction): TakuzuMiniState {
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
export function isTerminal(state: TakuzuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
