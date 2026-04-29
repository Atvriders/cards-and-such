import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface TripodSudokuMiniSettings { dummy: boolean; }
export interface TripodSudokuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type TripodSudokuMiniStateAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "A:1234|B:2.4.|C:.43.|share:?",
    "prompt": "Shared cell — A says it's 3, B says 1, C says ? — pick.",
    "choices": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "A:row=12.4|B:col=2.41|share top-right",
    "prompt": "Pick the shared cell.",
    "choices": [
      "3",
      "2",
      "4",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "share=1?,3?",
    "prompt": "What completes shared 2x2 with 1,3 fixed?",
    "choices": [
      "2",
      "4",
      "3",
      "1"
    ],
    "correct": 0
  },
  {
    "grid": "A grid forces 4|B grid forces 2|C undecided",
    "prompt": "Conflict resolution — answer is?",
    "choices": [
      "4",
      "2",
      "1",
      "3"
    ],
    "correct": 0
  },
  {
    "grid": "only one digit satisfies A AND B",
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
    "grid": "share row 1: 1,?",
    "prompt": "Combining all three grids — pick missing.",
    "choices": [
      "4",
      "2",
      "3",
      "1"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: TripodSudokuMiniSettings): TripodSudokuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: TripodSudokuMiniState, action: TripodSudokuMiniStateAction): TripodSudokuMiniState {
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
export function isTerminal(state: TripodSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
