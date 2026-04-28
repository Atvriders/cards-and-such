import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface Str8tsMiniSettings { dummy: boolean; }
export interface Str8tsMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type Str8tsMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "A white run of 3 cells contains 2 and 4. Third digit is?",
    "choices": [
      "3",
      "1",
      "5",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A run of 4 cells with 5,7,8 needs the missing digit?",
    "choices": [
      "4",
      "6",
      "9",
      "3"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Black clue cell with 5: white runs touching it cannot contain?",
    "choices": [
      "5",
      "4",
      "6",
      "none of these"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Run of 2 cells with 7. Possible neighbors?",
    "choices": [
      "6 or 8",
      "5 or 9",
      "3",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A length-5 straight starting at 3 ends at?",
    "choices": [
      "6",
      "7",
      "8",
      "5"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Black cell digits count toward row/column uniqueness?",
    "choices": [
      "yes",
      "no",
      "sometimes",
      "only at edges"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: Str8tsMiniSettings): Str8tsMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: Str8tsMiniState, action: Str8tsMiniAction): Str8tsMiniState {
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
export function isTerminal(state: Str8tsMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
