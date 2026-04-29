import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface HexadokuMiniSettings { dummy: boolean; }
export interface HexadokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type HexadokuMiniStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "1.2.|3.41|.32.|413.",
    "prompt": "Hex axis A reads 1,?,2,3 — what fills the slot?",
    "choices": [
      "4",
      "1",
      "2",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": ".1.2|3.4.|.243|1.32",
    "prompt": "Two axes intersect at the dot. Pick the digit.",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "12.4|.341|241.|3.12",
    "prompt": "Axis B sums to 10 in this row. Find the missing digit.",
    "choices": [
      "2",
      "1",
      "3",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "1234|34.1|2..3|.413",
    "prompt": "Top-down axis: 1,3,2,? — pick.",
    "choices": [
      "4",
      "3",
      "2",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "12..|3.41|..32|413.",
    "prompt": "Bottom axis: pick the second cell.",
    "choices": [
      "2",
      "4",
      "1",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "1...|34..|2..3|4123",
    "prompt": "Edge axis pattern requires?",
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
export function initialState(seed: number, _s: HexadokuMiniSettings): HexadokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: HexadokuMiniState, action: HexadokuMiniStateAction): HexadokuMiniState {
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
export function isTerminal(state: HexadokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
