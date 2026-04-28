import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface RippleEffectSettings { dummy: boolean; }
export interface RippleEffectState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type RippleEffectAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Two 3s in the same row need at least how many cells between them?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two 1s adjacent in a row: legal?",
    "choices": [
      "yes",
      "no",
      "only if same region",
      "only if different region"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A region of size 4 must contain digits?",
    "choices": [
      "1-3",
      "1-4",
      "1-5",
      "1-6"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A region of size 1 contains?",
    "choices": [
      "1",
      "any",
      "0",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two 4s in same column need how many cells between?",
    "choices": [
      "3",
      "4",
      "5",
      "2"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two 5s in different regions, same row: minimum gap?",
    "choices": [
      "4",
      "5",
      "6",
      "2"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: RippleEffectSettings): RippleEffectState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: RippleEffectState, action: RippleEffectAction): RippleEffectState {
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
export function isTerminal(state: RippleEffectState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
