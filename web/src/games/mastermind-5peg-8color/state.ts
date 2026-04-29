import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface Mastermind5peg8colorSettings { puzzles: "10"; }

export interface Mastermind5peg8colorState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type Mastermind5peg8colorAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Code: 5 pegs from 8 colors. Guess RYGBP gave 1 black + 1 white peg.", clues: ["Which is plausible?"], options: ["RYGBP","WORYG","WBRPK","KWPGY"], correctIndex: 2 },
  { scenario: "Code: 5 pegs.", clues: ["Guess WWWWW = 0/0. Eliminate?"], options: ["A code with 1 W","BRYGP","KKKKK","WBYGP"], correctIndex: 0 },
  { scenario: "Code: RBYRG. Guess RBYGP yields?", clues: ["Pick result."], options: ["3/0","3/1","4/1","2/2"], correctIndex: 1 },
  { scenario: "Code: ABCDE. Guess EDCBA yields?", clues: ["Pick result."], options: ["0/5","1/4","2/3","5/0"], correctIndex: 1 },
  { scenario: "After 4 guesses scoring 4-black, 5 are pegs.", clues: ["Final score per game?"], options: ["0","100","200","Master code cracked"], correctIndex: 3 },
  { scenario: "Guess WWWWW = 1/0; guess BBBBB = 1/0.", clues: ["Code distribution?"], options: ["All same color","Has 1 W and 1 B","Code has 2 different white, 2 black","Impossible"], correctIndex: 1 },
  { scenario: "8 colors include white(W),black(K),red(R),orange(O),yellow(Y),green(G),blue(B),purple(P).", clues: ["How many possible codes (with repeats)?"], options: ["6,720","32,768","100,000","16,807"], correctIndex: 1 },
  { scenario: "Guess RRRRR = 5/0.", clues: ["Code is?"], options: ["RRRRR","Mostly R","Hard to say","Five R's"], correctIndex: 0 },
  { scenario: "Without repeats allowed, code uses 5 distinct of 8.", clues: ["Total codes?"], options: ["8!/5!","8*7*6*5*4=6720","32,768","56"], correctIndex: 1 },
  { scenario: "Guess ABCDE=2/2 then BACDE=4/0.", clues: ["Code starts with?"], options: ["AB","BA","CD","DE"], correctIndex: 1 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: Mastermind5peg8colorSettings): Mastermind5peg8colorState {
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

export function reducer(state: Mastermind5peg8colorState, action: Mastermind5peg8colorAction): Mastermind5peg8colorState {
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

export function isTerminal(state: Mastermind5peg8colorState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
