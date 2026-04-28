import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface SuguruMiniSettings { dummy: boolean; }
export interface SuguruMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type SuguruMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "A region of size 3 must contain which digits?",
    "choices": [
      "1,2,3",
      "2,3,4",
      "1,3,5",
      "0,1,2"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Region size 5 contains digits?",
    "choices": [
      "1-5",
      "2-6",
      "0-4",
      "1,3,5"
    ],
    "correct": 0
  },
  {
    "grid": "1...|....|....|....",
    "prompt": "Cell (1,1)=1; diagonally adjacent (2,2) cannot be?",
    "choices": [
      "1",
      "2",
      "3",
      "any except 1"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two cells touching diagonally can share a digit in Suguru?",
    "choices": [
      "yes",
      "no",
      "only if same region",
      "only if size 1"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Region of size 1 contains?",
    "choices": [
      "1",
      "any",
      "0",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "If a 5-cell region has filled 1, 2, 3, 5, the missing digit is?",
    "choices": [
      "4",
      "6",
      "0",
      "2"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: SuguruMiniSettings): SuguruMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: SuguruMiniState, action: SuguruMiniAction): SuguruMiniState {
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
export function isTerminal(state: SuguruMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
