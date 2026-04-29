import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface Mastermind6peg10colorSettings { puzzles: "10"; }

export interface Mastermind6peg10colorState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type Mastermind6peg10colorAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "6-peg, 10-color code. How many possible codes (repeats allowed)?", clues: ["Pick."], options: ["10^6 = 1,000,000","60","10!","720"], correctIndex: 0 },
  { scenario: "Guess all-same yields 0/0.", clues: ["Eliminate?"], options: ["Codes with that color","Just first slot","Nothing","All possibilities"], correctIndex: 0 },
  { scenario: "No repeats variant: codes use 6 of 10.", clues: ["Total?"], options: ["10!/6!","10P6 = 151,200","60,000","1,000,000"], correctIndex: 1 },
  { scenario: "Guess scored 3/2 means?", clues: ["Pick."], options: ["3 right spot + 2 wrong spot","3 right color + 2 right spot","3 wins + 2 losses","All 5 matched"], correctIndex: 0 },
  { scenario: "Maximum guesses to guarantee solve in 6-peg, 10-color?", clues: ["Approx."], options: ["3","6","8","20+"], correctIndex: 3 },
  { scenario: "Two consecutive 0/0 guesses.", clues: ["Eliminate?"], options: ["All colors in those guesses","Half of possibilities","Nothing","6 colors"], correctIndex: 0 },
  { scenario: "Code RYGBOP. Guess RYGBOP gives?", clues: ["Pick."], options: ["6/0 win","0/6","3/3","6/6"], correctIndex: 0 },
  { scenario: "Information-theoretic best opening guess uses?", clues: ["Pick."], options: ["Diverse colors","Same color","Random","Always RRRRRR"], correctIndex: 0 },
  { scenario: "After feedback 0/2, the code contains?", clues: ["Pick."], options: ["Two of those colors but in wrong spots","Zero of those colors","Two correct positions","Two same as guess everywhere"], correctIndex: 0 },
  { scenario: "Game ends when?", clues: ["Pick."], options: ["6 black pegs","20 turns","First 0/0","Both: solve or attempt limit"], correctIndex: 3 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: Mastermind6peg10colorSettings): Mastermind6peg10colorState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_PUZZLES], rng).slice(0, Math.min(10, ALL_PUZZLES.length));
  return {
    puzzles: pool,
    currentIndex: 0,
    selected: null,
    resolved: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: Mastermind6peg10colorState, action: Mastermind6peg10colorAction): Mastermind6peg10colorState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select":
      return state.resolved ? state : { ...state, selected: action.index };
    case "submit": {
      if (state.resolved || state.selected === null) return state;
      const p = state.puzzles[state.currentIndex]!;
      const ok = state.selected === p.correctIndex;
      return {
        ...state,
        resolved: true,
        score: state.score + (ok ? 100 : 0),
        correctCount: state.correctCount + (ok ? 1 : 0),
        phase: "result",
      };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      if (ni >= state.puzzles.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: ni, selected: null, resolved: false, phase: "playing" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: Mastermind6peg10colorState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
