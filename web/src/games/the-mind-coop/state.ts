import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface TheMindCoopSettings { puzzles: "10"; }

export interface TheMindCoopState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type TheMindCoopAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "The Mind: players hold numbered cards.", clues: ["Goal?"], options: ["Play in ascending order without communication","Match suits","Trade fastest","Last card wins"], correctIndex: 0 },
  { scenario: "Communication allowed?", clues: ["Pick."], options: ["Only via timing","Always speak","Hand signals","Drawing"], correctIndex: 0 },
  { scenario: "Card range?", clues: ["Pick."], options: ["1-100","1-50","1-20","1-99"], correctIndex: 0 },
  { scenario: "Cards held per round?", clues: ["Pick."], options: ["Equal to round number","Always 3","Always 7","Variable"], correctIndex: 0 },
  { scenario: "Lose a life when?", clues: ["Pick."], options: ["Card played out of order","Each round","Talking","Slow play"], correctIndex: 0 },
  { scenario: "Ninja star (special)?", clues: ["Pick."], options: ["Each play simultaneously lowest from each hand","Bonus card","Reset","Wins game"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Wolfgang Warsch","Reiner Knizia","Bruno Cathala","Antoine Bauza"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2018","2010","2020","2005"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["2-4","2","6-8","Solo"], correctIndex: 0 },
  { scenario: "Levels played to win?", clues: ["Pick."], options: ["8-12 depending on count","Always 5","Until time out","Solo only"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: TheMindCoopSettings): TheMindCoopState {
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

export function reducer(state: TheMindCoopState, action: TheMindCoopAction): TheMindCoopState {
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

export function isTerminal(state: TheMindCoopState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
