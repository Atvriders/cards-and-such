import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface YinYangPuzzleSettings { dummy: boolean; }
export interface YinYangPuzzleState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type YinYangPuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "A 2x2 block all one color is allowed?",
    "choices": [
      "yes",
      "no",
      "only black",
      "only white"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two black cells separated by white with no path of black: legal?",
    "choices": [
      "yes",
      "no (must be connected)",
      "only at edges",
      "sometimes"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Yin-Yang uses how many colors?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Diagonal connectivity counts?",
    "choices": [
      "yes",
      "no, orthogonal only",
      "sometimes",
      "only at corners"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "All white cells must be connected. True?",
    "choices": [
      "true",
      "false",
      "only black",
      "neither"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Smallest forbidden monochrome shape is?",
    "choices": [
      "1x2",
      "2x2",
      "3x3",
      "2x3"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: YinYangPuzzleSettings): YinYangPuzzleState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: YinYangPuzzleState, action: YinYangPuzzleAction): YinYangPuzzleState {
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
export function isTerminal(state: YinYangPuzzleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
