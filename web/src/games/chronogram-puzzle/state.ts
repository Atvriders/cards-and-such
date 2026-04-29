import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface ChronogramPuzzleSettings { dummy: boolean; }
export interface ChronogramPuzzleState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type ChronogramPuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "MDLXVII|.......|.......|.......",
    "prompt": "Sum the Roman numerals in MDLXVII.",
    "choices": [
      "1567",
      "1568",
      "1577",
      "1467"
    ],
    "correct": 0
  },
  {
    "grid": "VIVA|REX.|....|....",
    "prompt": "Sum Roman numerals in VIVAREX (V,I,V, then no more numerals: REX has X=10).",
    "choices": [
      "20",
      "21",
      "11",
      "16"
    ],
    "correct": 0
  },
  {
    "grid": "MMXX|....|....|....",
    "prompt": "MMXX equals what year?",
    "choices": [
      "2000",
      "2010",
      "2020",
      "2200"
    ],
    "correct": 2
  },
  {
    "grid": "LXIV|....|....|....",
    "prompt": "LXIV is what number?",
    "choices": [
      "54",
      "64",
      "66",
      "44"
    ],
    "correct": 1
  },
  {
    "grid": "MCMXC|.....|.....|.....",
    "prompt": "MCMXC equals what year?",
    "choices": [
      "1990",
      "1980",
      "1090",
      "2090"
    ],
    "correct": 0
  },
  {
    "grid": "MDCLI|.....|.....|.....",
    "prompt": "Sum the Roman numerals in MDCLI.",
    "choices": [
      "1651",
      "1751",
      "1561",
      "1601"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: ChronogramPuzzleSettings): ChronogramPuzzleState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: ChronogramPuzzleState, action: ChronogramPuzzleAction): ChronogramPuzzleState {
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
export function isTerminal(state: ChronogramPuzzleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
