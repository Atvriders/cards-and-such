import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Puzzle { grid: string; prompt: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface GermanWhispersSudokuSettings { dummy: boolean; }
export interface GermanWhispersSudokuState { puzzles: Puzzle[]; idx: number; selected: number | null; submitted: boolean; score: number; correct: number; phase: "playing"|"result"|"done"; }
export type GermanWhispersSudokuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const PUZZLES: Puzzle[] = [
  {
    "grid": "9*.|...|...",
    "prompt": "On a green line, (1,2) follows 9. Difference >= 5 means (1,2) is?",
    "choices": [
      "8",
      "6",
      "4",
      "9"
    ],
    "correct": 2
  },
  {
    "grid": "....|.5..|....|....",
    "prompt": "5 is on a green line: legal?",
    "choices": [
      "yes",
      "no",
      "sometimes",
      "only at end"
    ],
    "correct": 1
  },
  {
    "grid": "1*.|...|...",
    "prompt": "Green line: (1,1)=1, (1,2) needs |x-1|>=5. Smallest legal x?",
    "choices": [
      "6",
      "5",
      "4",
      "2"
    ],
    "correct": 0
  },
  {
    "grid": "8*.|...|...",
    "prompt": "Green line, 8 then ? Smallest legal next is?",
    "choices": [
      "3",
      "2",
      "4",
      "1"
    ],
    "correct": 3
  },
  {
    "grid": "....|....|....|....",
    "prompt": "On a green line of length 3, the middle digit can be?",
    "choices": [
      "5",
      "4",
      "9",
      "any"
    ],
    "correct": 1
  },
  {
    "grid": "....|7*..|....|....",
    "prompt": "Cell (2,1)=7 on green line. Next line cell candidate?",
    "choices": [
      "6",
      "5",
      "2",
      "8"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(rng()*(i+1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }
export function initialState(seed: number, _s: GermanWhispersSudokuSettings): GermanWhispersSudokuState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return { puzzles, idx: 0, selected: null, submitted: false, score: 0, correct: 0, phase: "playing" };
}
export function reducer(state: GermanWhispersSudokuState, action: GermanWhispersSudokuAction): GermanWhispersSudokuState {
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
export function isTerminal(state: GermanWhispersSudokuState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
