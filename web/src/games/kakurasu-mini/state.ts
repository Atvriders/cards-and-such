import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: string[]; correct: number; }
export interface KakurasuMiniSettings { dummy: boolean; }
export interface KakurasuMiniState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type KakurasuMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "X...|....|....|....",
    "prompt": "Row 1 needs sum 1 from indices 1-4. Cell at column 1 is shaded. Is that valid?",
    "choices": [
      "Yes (sum=1)",
      "No (sum=2)",
      "No (sum=3)",
      "No (sum=4)"
    ],
    "correct": 0
  },
  {
    "grid": "....|.X..|....|....",
    "prompt": "Row 2 has cell shaded at column 2. Sum equals?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "grid": "..X.|....|....|....",
    "prompt": "Row 1 cell shaded at column 3. Sum equals?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "grid": "...X|....|....|....",
    "prompt": "Row 1 cell shaded at column 4. Sum equals?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 3
  },
  {
    "grid": "X.X.|....|....|....",
    "prompt": "Row 1 has cells shaded at columns 1 and 3. Sum equals?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "grid": "X..X|....|....|....",
    "prompt": "Row 1 has cells shaded at columns 1 and 4. Sum equals?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: KakurasuMiniSettings): KakurasuMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: KakurasuMiniState, action: KakurasuMiniAction): KakurasuMiniState {
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
export function isTerminal(state: KakurasuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
