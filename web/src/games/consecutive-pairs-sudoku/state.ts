import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface ConsecutivePairsSudokuSettings { dummy: boolean; }
export interface ConsecutivePairsSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type ConsecutivePairsSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "2*.|...|...",
    "prompt": "A * marks (1,1)-(1,2) as a consecutive pair. (1,1)=2, so (1,2) is?",
    "choices": [
      "1 or 3",
      "2",
      "4",
      "1, 3, or 4"
    ],
    "correct": 0
  },
  {
    "grid": "1...|....|....|....",
    "prompt": "Marked dot between (1,1)-(1,2). (1,2) candidate?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|.4..|....|....",
    "prompt": "Cell (1,2) and (2,2)=4 are an unmarked pair so cannot be consecutive. (1,2) cannot be?",
    "choices": [
      "3 or 5",
      "1 or 2",
      "4 itself",
      "2 only"
    ],
    "correct": 0
  },
  {
    "grid": "3...|....|....|....",
    "prompt": "Marked pair (1,1)-(2,1). (1,1)=3, (2,1) is?",
    "choices": [
      "1",
      "2 or 4",
      "3",
      "2 only"
    ],
    "correct": 1
  },
  {
    "grid": "....|..2.|....|....",
    "prompt": "Unmarked (2,3)=2 and (1,3). (1,3) cannot be 1 or 3. Allowed?",
    "choices": [
      "1",
      "3",
      "2 or 4",
      "both 1 and 3"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|.4..",
    "prompt": "(4,2)=4. Marked dot to (3,2). (3,2) is?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: ConsecutivePairsSudokuSettings): ConsecutivePairsSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: ConsecutivePairsSudokuState, action: ConsecutivePairsSudokuAction): ConsecutivePairsSudokuState {
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
export function isTerminal(state: ConsecutivePairsSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
