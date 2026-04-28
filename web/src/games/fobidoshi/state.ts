import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface FobidoshiSettings { dummy: boolean; }
export interface FobidoshiState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type FobidoshiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Two circles orthogonally adjacent: legal in Fobidoshi?",
    "choices": [
      "yes",
      "no",
      "only diagonally",
      "only at edge"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Hint cell with number 2 in a 4-wide row: how many circles in that row?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A 4-wide row with non-adjacency rule: max circles?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal touch between circles: legal?",
    "choices": [
      "yes",
      "no",
      "only at corners",
      "sometimes"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Hint cells themselves contain circles?",
    "choices": [
      "yes",
      "no",
      "sometimes",
      "only if 0"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "5-wide row with non-adjacency: max circles?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: FobidoshiSettings): FobidoshiState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: FobidoshiState, action: FobidoshiAction): FobidoshiState {
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
export function isTerminal(state: FobidoshiState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
