import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface CrossNumberSettings { dummy: boolean; }
export interface CrossNumberState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type CrossNumberAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1234|.A..|....|....",
    "prompt": "Top row sums to 10. What is A in row 2 col 2 if A is half the row 1 sum minus 4?",
    "choices": [
      "1",
      "2",
      "3",
      "0"
    ],
    "correct": 0
  },
  {
    "grid": "....|.5..|....|....",
    "prompt": "Cell shows 5. What is 5 squared?",
    "choices": [
      "10",
      "15",
      "20",
      "25"
    ],
    "correct": 3
  },
  {
    "grid": "9...|....|....|....",
    "prompt": "First cell is 9. What is the largest single digit?",
    "choices": [
      "8",
      "9",
      "7",
      "0"
    ],
    "correct": 1
  },
  {
    "grid": "....|7...|....|....",
    "prompt": "What is 7 + 7?",
    "choices": [
      "14",
      "15",
      "13",
      "12"
    ],
    "correct": 0
  },
  {
    "grid": "12..|....|....|....",
    "prompt": "12 reversed equals what two-digit number?",
    "choices": [
      "12",
      "21",
      "11",
      "31"
    ],
    "correct": 1
  },
  {
    "grid": "....|3.4.|....|....",
    "prompt": "3 + 4 + 5 = ?",
    "choices": [
      "10",
      "11",
      "12",
      "13"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: CrossNumberSettings): CrossNumberState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: CrossNumberState, action: CrossNumberAction): CrossNumberState {
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
export function isTerminal(state: CrossNumberState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
