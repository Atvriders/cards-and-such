import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface DutchWhispersSudokuSettings { dummy: boolean; }
export interface DutchWhispersSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type DutchWhispersSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "5*.|...|...",
    "prompt": "Line: (1,1)=5, (1,2) needs |x-5|>=4. Allowed values?",
    "choices": [
      "1 or 9",
      "6",
      "4",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "3*.|...|...",
    "prompt": "Line cell after 3: |x-3|>=4 so x>=7 or x<= -1 (impossible). Allowed range?",
    "choices": [
      "1 to 9",
      "7 8 9",
      "5 only",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|.6..|....|....",
    "prompt": "(2,2)=6 on line. Line neighbor cannot equal?",
    "choices": [
      "3",
      "9",
      "2",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "9*.|...|...",
    "prompt": "Line: 9 then ? Legal candidates?",
    "choices": [
      "1-5",
      "6-8",
      "8 only",
      "2 only"
    ],
    "correct": 0
  },
  {
    "grid": "4*.|...|...",
    "prompt": "Line after 4: |x-4|>=4 so x=8 or 9 (or x<=0). Pick.",
    "choices": [
      "1",
      "5",
      "8",
      "3"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "On a Dutch line of length 2 with no clue, can both cells be 5?",
    "choices": [
      "yes",
      "no",
      "only if same row",
      "depends"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: DutchWhispersSudokuSettings): DutchWhispersSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: DutchWhispersSudokuState, action: DutchWhispersSudokuAction): DutchWhispersSudokuState {
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
export function isTerminal(state: DutchWhispersSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
