import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface AwkwardGuestsSettings { puzzles: "10"; }

export interface AwkwardGuestsState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type AwkwardGuestsAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Awkward Guests has?", clues: ["Pick."], options: ["Murder mystery card-deduction","Word game","Spelling","Drawing"], correctIndex: 0 },
  { scenario: "Solution dimensions?", clues: ["Pick."], options: ["Suspect, weapon, motive, evidence","Just suspect","Random","Numbered"], correctIndex: 0 },
  { scenario: "Cards exchanged via?", clues: ["Pick."], options: ["Trade phase based on energy points","Free","Auction","Roll"], correctIndex: 0 },
  { scenario: "Win condition?", clues: ["Pick."], options: ["Correct accusation","Most points","Time out","Vote"], correctIndex: 0 },
  { scenario: "Wrong accusation?", clues: ["Pick."], options: ["Reduces info you can publicly act on / penalty","Lose","Skip","Score+"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Carlos Llopis","Bruno Cathala","Reiner Knizia","Wolfgang Warsch"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2016","2010","2020","2018"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["1-8","2","12+","Solo only"], correctIndex: 0 },
  { scenario: "Number of unique cases?", clues: ["Pick."], options: ["~3000","1","100","10"], correctIndex: 0 },
  { scenario: "Theme?", clues: ["Pick."], options: ["Victorian house party murder","Sci-fi","Pirate","Western"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: AwkwardGuestsSettings): AwkwardGuestsState {
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

export function reducer(state: AwkwardGuestsState, action: AwkwardGuestsAction): AwkwardGuestsState {
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

export function isTerminal(state: AwkwardGuestsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
