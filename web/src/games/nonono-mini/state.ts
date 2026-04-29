import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface NononoMiniSettings { dummy: boolean; }
export interface NononoMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type NononoMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "X...|.X..|..X.|...X",
    "prompt": "Cells shaded along main diagonal. Diagonal clue: how many shaded?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 2
  },
  {
    "grid": "...X|..X.|.X..|X...",
    "prompt": "Anti-diagonal cells shaded. Anti-diagonal length in 4x4?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "grid": "X...|....|....|....",
    "prompt": "Single shaded cell at (1,1). On main diagonal of 4x4 grid.",
    "choices": [
      "Yes, (1,1) is on main diag",
      "No, off diag",
      "Only if also (4,4)",
      "Diagonal undefined"
    ],
    "correct": 0
  },
  {
    "grid": "....|.X..|X.X.|.X..",
    "prompt": "Diamond shape. Cells along anti-diagonal of 3-3?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "X...|X...|X...|X...",
    "prompt": "Column 1 fully shaded. How many appear on main diagonal?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "XXXX|....|....|....",
    "prompt": "Row 1 fully shaded. Anti-diagonal contains how many shaded cells?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: NononoMiniSettings): NononoMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: NononoMiniState, action: NononoMiniAction): NononoMiniState {
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
export function isTerminal(state: NononoMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
