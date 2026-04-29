import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface TridokuMiniSettings { dummy: boolean; }
export interface TridokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type TridokuMiniStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "12..|.3..|..2.|...4",
    "prompt": "Side line 1 contains 1,2,?,? — what's the missing pair member shown?",
    "choices": [
      "3",
      "4",
      "1",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "1.34|.2..|.3.4|2..1",
    "prompt": "Medial line meets — pick the missing value at center.",
    "choices": [
      "1",
      "2",
      "4",
      "3"
    ],
    "correct": 3
  },
  {
    "grid": ".234|1.34|12..|123.",
    "prompt": "Region constraint: pick the digit for the dot.",
    "choices": [
      "4",
      "2",
      "1",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "1...|.2..|..3.|4...",
    "prompt": "Diagonal of the triangle reads 1,2,3,? — pick.",
    "choices": [
      "4",
      "3",
      "2",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "1234|2341|3412|41..",
    "prompt": "Last row has 4,1,?,? — what's the third cell?",
    "choices": [
      "2",
      "3",
      "4",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "..23|.123|123.|..21",
    "prompt": "Left edge missing top digit?",
    "choices": [
      "1",
      "4",
      "2",
      "3"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: TridokuMiniSettings): TridokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: TridokuMiniState, action: TridokuMiniStateAction): TridokuMiniState {
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
export function isTerminal(state: TridokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
