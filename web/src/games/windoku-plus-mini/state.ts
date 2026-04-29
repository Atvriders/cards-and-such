import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface WindokuPlusMiniSettings { dummy: boolean; }
export interface WindokuPlusMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type WindokuPlusMiniStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "row=12.4|col=2.41|box=234.|win=12.3",
    "prompt": "Window contains 1,2,3 already — needs?",
    "choices": [
      "4",
      "1",
      "2",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "row+window combined narrow to one digit",
    "prompt": "Pick.",
    "choices": [
      "3",
      "2",
      "4",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "both windows force?",
    "prompt": "Pick.",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "window plus column intersect",
    "prompt": "Pick.",
    "choices": [
      "2",
      "3",
      "4",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "only window constraint matters",
    "prompt": "Pick.",
    "choices": [
      "4",
      "2",
      "3",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "window has 1,3,4 — needs?",
    "prompt": "Pick.",
    "choices": [
      "2",
      "1",
      "3",
      "4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: WindokuPlusMiniSettings): WindokuPlusMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: WindokuPlusMiniState, action: WindokuPlusMiniStateAction): WindokuPlusMiniState {
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
export function isTerminal(state: WindokuPlusMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
