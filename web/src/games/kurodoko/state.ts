import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface KurodokoSettings { dummy: boolean; }
export interface KurodokoState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type KurodokoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Two black cells orthogonally adjacent: legal?",
    "choices": [
      "yes",
      "no",
      "only diagonally",
      "sometimes"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Numbered cell shows 5. Counting itself, total white cells visible (row + col) is?",
    "choices": [
      "4",
      "5",
      "6",
      "depends"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "All white cells must be connected: true?",
    "choices": [
      "true",
      "false",
      "sometimes",
      "only diagonally"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Numbered cells can themselves be shaded black?",
    "choices": [
      "yes",
      "no, always white",
      "only at edges",
      "sometimes"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Cell shows 1 — how many white cells does it see (incl. itself)?",
    "choices": [
      "0",
      "1",
      "2",
      "none"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Visibility blocked by what?",
    "choices": [
      "any black cell or grid edge",
      "only edges",
      "only blacks",
      "other numbers"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: KurodokoSettings): KurodokoState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: KurodokoState, action: KurodokoAction): KurodokoState {
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
export function isTerminal(state: KurodokoState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
