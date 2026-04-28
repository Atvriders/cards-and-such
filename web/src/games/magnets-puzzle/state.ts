import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface MagnetsPuzzleSettings { dummy: boolean; }
export interface MagnetsPuzzleState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type MagnetsPuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "....|....|....|....",
    "prompt": "Two cells horizontally adjacent both contain +. Legal?",
    "choices": [
      "yes",
      "no",
      "only if same domino",
      "only if different rows"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "A 1x2 domino can hold which pole arrangements?",
    "choices": [
      "+,+",
      "+,- or -,+ or blank,blank",
      "+,-",
      "blank,blank only"
    ],
    "correct": 1
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Row counts say 2 plus, 1 minus. Total marked cells in row?",
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
    "prompt": "Two + cells diagonally touching: legal?",
    "choices": [
      "yes",
      "no",
      "only at edge",
      "sometimes"
    ],
    "correct": 0
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Neutral dominoes contribute to row/col + and - counts?",
    "choices": [
      "+ only",
      "- only",
      "neither",
      "both"
    ],
    "correct": 2
  },
  {
    "grid": "....|....|....|....",
    "prompt": "Two - cells share a vertical edge. Legal?",
    "choices": [
      "yes",
      "no",
      "only at column ends",
      "only if neutral above"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: MagnetsPuzzleSettings): MagnetsPuzzleState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: MagnetsPuzzleState, action: MagnetsPuzzleAction): MagnetsPuzzleState {
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
export function isTerminal(state: MagnetsPuzzleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
