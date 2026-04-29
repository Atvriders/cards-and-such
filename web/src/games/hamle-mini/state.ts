import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface HamleMiniSettings { dummy: boolean; }
export interface HamleMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type HamleMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "2...|....|....|...2",
    "prompt": "Two 2s in opposite corners need to be adjacent to one same-numbered piece. Min moves?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "1...|....|....|....",
    "prompt": "A single 1 needs to be adjacent to one same-numbered piece. Possible?",
    "choices": [
      "Yes, in 1 move",
      "No, not enough pieces",
      "Only if multiple 1s",
      "Always"
    ],
    "correct": 1
  },
  {
    "grid": "33..|....|....|....",
    "prompt": "Two 3s adjacent. Each needs to be adjacent to two more 3s. Need how many more 3s?",
    "choices": [
      "0",
      "1",
      "2",
      "3"
    ],
    "correct": 2
  },
  {
    "grid": "2..2|....|....|....",
    "prompt": "Two 2s in row 1, columns 1 and 4. Each needs one same-value adjacent neighbor. Goal possible?",
    "choices": [
      "Yes, slide together",
      "No, walls block",
      "Only via diagonal",
      "Need more 2s"
    ],
    "correct": 0
  },
  {
    "grid": "....|.4..|....|....",
    "prompt": "Single 4 at (2,2). For 4 to satisfy needing 4 same-value neighbors — possible in 4x4?",
    "choices": [
      "Yes",
      "No, only 4 directions exist",
      "Only with 5 pieces total",
      "Need a 4 in every adjacent cell"
    ],
    "correct": 3
  },
  {
    "grid": "1.1.|....|....|....",
    "prompt": "Two 1s in row 1, columns 1 and 3. Each needs 1 same-value neighbor. Slide right makes them adjacent — moves?",
    "choices": [
      "1",
      "2",
      "3",
      "0 already"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: HamleMiniSettings): HamleMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: HamleMiniState, action: HamleMiniAction): HamleMiniState {
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
export function isTerminal(state: HamleMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
