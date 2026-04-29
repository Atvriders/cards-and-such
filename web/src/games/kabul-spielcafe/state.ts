import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface KabulSpielcafeSettings { puzzles: "10"; }

export interface KabulSpielcafeState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type KabulSpielcafeAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Kabul / Cabo style: each player has hidden cards summing to score.", clues: ["Goal?"], options: ["Lowest sum","Highest sum","Match suits","Most cards"], correctIndex: 0 },
  { scenario: "Each player can peek at?", clues: ["Pick."], options: ["2 of own 4 cards","All cards","Opponents'","None"], correctIndex: 0 },
  { scenario: "Special action cards?", clues: ["Pick."], options: ["Peek, swap, reveal","Move, draw, score","Discard","No"], correctIndex: 0 },
  { scenario: "Calling 'Kabul/Cabo'?", clues: ["Pick."], options: ["Forces final round, lowest wins","Skips turn","Trades","Wins"], correctIndex: 0 },
  { scenario: "If caller doesn't have lowest?", clues: ["Pick."], options: ["Penalty (e.g., +10)","Wins","Tie","Skip"], correctIndex: 0 },
  { scenario: "Card range?", clues: ["Pick."], options: ["0-13","1-10","1-100","A-K only"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["2-6","Solo","8-10","2"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Mandy Goldberg-Lev","Reiner Knizia","Bruno Faidutti","Sid Sackson"], correctIndex: 0 },
  { scenario: "Card count in deck?", clues: ["Pick."], options: ["52","60","40","30"], correctIndex: 0 },
  { scenario: "Original publication?", clues: ["Pick."], options: ["2010s","1980s","1950s","2000s"], correctIndex: 3 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: KabulSpielcafeSettings): KabulSpielcafeState {
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

export function reducer(state: KabulSpielcafeState, action: KabulSpielcafeAction): KabulSpielcafeState {
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

export function isTerminal(state: KabulSpielcafeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
