import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface KakuroCrossSumsSettings { dummy: boolean; }
export interface KakuroCrossSumsState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type KakuroCrossSumsStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "run sum=17, cells=8,?",
    "prompt": "Pair needs?",
    "choices": [
      "9",
      "8",
      "6",
      "7"
    ],
    "correct": 0
  },
  {
    "grid": "run sum=6, three cells=1,2,?",
    "prompt": "Pick.",
    "choices": [
      "3",
      "2",
      "4",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "run sum=23, four cells=9,?,?,?",
    "prompt": "Cell value?",
    "choices": [
      "6",
      "1",
      "8",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "run sum=10, two cells=4,?",
    "prompt": "Pick.",
    "choices": [
      "6",
      "4",
      "2",
      "8"
    ],
    "correct": 0
  },
  {
    "grid": "run sum=15, three cells={1,5,?}",
    "prompt": "Pick.",
    "choices": [
      "9",
      "6",
      "2",
      "4"
    ],
    "correct": 0
  },
  {
    "grid": "run sum=11, two cells=2,?",
    "prompt": "Pick.",
    "choices": [
      "9",
      "6",
      "3",
      "5"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: KakuroCrossSumsSettings): KakuroCrossSumsState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: KakuroCrossSumsState, action: KakuroCrossSumsStateAction): KakuroCrossSumsState {
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
export function isTerminal(state: KakuroCrossSumsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
