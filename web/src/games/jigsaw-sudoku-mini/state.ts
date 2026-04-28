import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface JigsawSudokuMiniSettings { dummy: boolean; }
export interface JigsawSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type JigsawSudokuMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1...|.2..|..3.|....",
    "prompt": "Row 4 already has 1, 2, 3 elsewhere. Last cell takes which value?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 3
  },
  {
    "grid": "1234|....|....|....",
    "prompt": "Jigsaw region containing cells (1,1) and (2,1) must hold each digit once. (2,1) is?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "..2.|1...|....|....",
    "prompt": "Column 1 already shows 1; the region wraps to row 3 col 1. That cell is?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "3...|....|...3|....",
    "prompt": "Diagonal region requires unique digits. Center cell candidate must avoid 3. Best fit?",
    "choices": [
      "3",
      "1",
      "2",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|2.4.|....|3...",
    "prompt": "Region spanning row 2 needs 1 and 3. Cell (2,1) is?",
    "choices": [
      "3",
      "1",
      "2",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|4321",
    "prompt": "Bottom row is fixed. Vertical jigsaw region in col 1 needs 1, 2, 3 above the 4. Cell (1,1) candidate?",
    "choices": [
      "4",
      "1",
      "2",
      "3"
    ],
    "correct": 3
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: JigsawSudokuMiniSettings): JigsawSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: JigsawSudokuMiniState, action: JigsawSudokuMiniAction): JigsawSudokuMiniState {
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
export function isTerminal(state: JigsawSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
