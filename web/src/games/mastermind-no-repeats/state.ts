import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface MastermindNoRepeatsSettings { puzzles: "10"; }

export interface MastermindNoRepeatsState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type MastermindNoRepeatsAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "4-peg code, 6 colors, no repeats. Total codes?", clues: ["Pick."], options: ["1296","360","6!/2!","24"], correctIndex: 1 },
  { scenario: "Guess RRGY = ?", clues: ["Pick the impossible feedback."], options: ["0/0","2/0","1/2","Repeated colors disallowed in guess"], correctIndex: 1 },
  { scenario: "Guess RYGB = 0/4.", clues: ["Code is?"], options: ["A permutation of RYGB","Any 4 colors","RYGB","BGYR"], correctIndex: 0 },
  { scenario: "Information per guess is highest from?", clues: ["Pick."], options: ["Uniform distribution of new colors","Repeated old colors","Same answer twice","Empty guess"], correctIndex: 0 },
  { scenario: "Knuth's 5-guess solver applies to?", clues: ["Pick."], options: ["Standard 4-peg 6-color repeats","No-repeat variant","Any size","Only 5-peg 8-color"], correctIndex: 0 },
  { scenario: "Guess RYGB = 4/0.", clues: ["Code is?"], options: ["RYGB","Permutation","Need more info","Cracked"], correctIndex: 0 },
  { scenario: "Guess RRGB invalid because?", clues: ["Pick."], options: ["Repeats banned in this variant","Only 4 colors allowed","R is forbidden","Color limit"], correctIndex: 0 },
  { scenario: "Two guesses both 0/4.", clues: ["Confirm?"], options: ["Code uses same 4 colors as both guesses (impossible if diff)","Always cracked","Code unique","Nothing"], correctIndex: 0 },
  { scenario: "Probability random guess matches code 4/0?", clues: ["Pick."], options: ["1/24","1/360","1/1296","1/120"], correctIndex: 1 },
  { scenario: "Turing thought puzzle: code 1234, guess 4321.", clues: ["Score?"], options: ["0/4","2/2","4/0","1/3"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: MastermindNoRepeatsSettings): MastermindNoRepeatsState {
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

export function reducer(state: MastermindNoRepeatsState, action: MastermindNoRepeatsAction): MastermindNoRepeatsState {
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

export function isTerminal(state: MastermindNoRepeatsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
