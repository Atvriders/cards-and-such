import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface CodenamesXxlSettings { puzzles: "10"; }

export interface CodenamesXxlState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type CodenamesXxlAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Codenames XXL is?", clues: ["Pick."], options: ["Original Codenames with bigger cards","Different game","Sequel","Spinoff"], correctIndex: 0 },
  { scenario: "Why XXL exists?", clues: ["Pick."], options: ["Better for large groups","Better for kids","More words","Less words"], correctIndex: 0 },
  { scenario: "Card grid?", clues: ["Pick."], options: ["5x5","4x4","6x6","3x3"], correctIndex: 0 },
  { scenario: "Spymaster sees?", clues: ["Pick."], options: ["Color key map","Nothing","Same as team","Half map"], correctIndex: 0 },
  { scenario: "Number of words on each card?", clues: ["Pick."], options: ["1","2","4","Variable"], correctIndex: 0 },
  { scenario: "Win condition?", clues: ["Pick."], options: ["Reveal all team's words first","Most cards","Time out","No"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Vlaada Chvátil","Reiner Knizia","Wolfgang Warsch","Antoine Bauza"], correctIndex: 0 },
  { scenario: "Year of XXL release?", clues: ["Pick."], options: ["2017","2015","2020","2012"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["4+","2","Solo","20"], correctIndex: 0 },
  { scenario: "What does the assassin do?", clues: ["Pick."], options: ["Instant loss when guessed","Wins","Skips","Bonus"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: CodenamesXxlSettings): CodenamesXxlState {
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

export function reducer(state: CodenamesXxlState, action: CodenamesXxlAction): CodenamesXxlState {
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

export function isTerminal(state: CodenamesXxlState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
