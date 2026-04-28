import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface RenbanSudokuSettings { dummy: boolean; }
export interface RenbanSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type RenbanSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "12*.|....|....|....",
    "prompt": "Renban length 3 has 1, 2 already. Final cell must be?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "23*.|....|....|....",
    "prompt": "Renban {2,3,?} length 3. Missing digit?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "....|.45.|....|....",
    "prompt": "Renban {4,5,x} length 3. x is?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|9.8.|....",
    "prompt": "Renban length 3 has 8 and 9. Third digit must be?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|123.",
    "prompt": "Renban length 4: 1,2,3,? Last digit?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 3
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A renban of length 5 starts at 3. Largest digit on the line?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: RenbanSudokuSettings): RenbanSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: RenbanSudokuState, action: RenbanSudokuAction): RenbanSudokuState {
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
export function isTerminal(state: RenbanSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
