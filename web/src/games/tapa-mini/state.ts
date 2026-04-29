import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface TapaMiniSettings { dummy: boolean; }
export interface TapaMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type TapaMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|.3..|....|....",
    "prompt": "Clue 3 at (2,2). Means 3 connected shaded neighbors (of 8). Min shaded count?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "....|.1..|....|....",
    "prompt": "Clue 1 at (2,2). Exactly one shaded neighbor. Where can it be?",
    "choices": [
      "Any of 8 neighbors",
      "Only adjacent 4",
      "Only diagonal",
      "Only top neighbor"
    ],
    "correct": 0
  },
  {
    "grid": "....|.X1.|....|....",
    "prompt": "Clue 1 at (2,3). Already shaded at (2,2). Shaded count satisfied?",
    "choices": [
      "Yes, exactly 1",
      "No, need more",
      "No, too many",
      "Can't tell"
    ],
    "correct": 0
  },
  {
    "grid": "XX..|XX..|....|....",
    "prompt": "2x2 shaded block at top-left. Allowed in Tapa?",
    "choices": [
      "Yes",
      "No, 2x2 forbidden",
      "Only at edges",
      "Only if no clue"
    ],
    "correct": 1
  },
  {
    "grid": ".X..|X.X.|.X..|....",
    "prompt": "Diamond pattern of shaded cells. Are they connected (orthogonally)?",
    "choices": [
      "Yes",
      "No, only diagonal",
      "Only if also corner",
      "Always"
    ],
    "correct": 1
  },
  {
    "grid": "....|.22.|....|....",
    "prompt": "Clue \"2 2\" means two groups of 2. Min shaded around?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: TapaMiniSettings): TapaMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: TapaMiniState, action: TapaMiniAction): TapaMiniState {
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
export function isTerminal(state: TapaMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
