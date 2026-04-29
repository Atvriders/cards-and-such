import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface MysteriumVisionsSettings { puzzles: "10"; }

export interface MysteriumVisionsState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type MysteriumVisionsAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Mysterium has 1 ghost + many psychics.", clues: ["Goal?"], options: ["Identify culprit, weapon, room","Drawing","Singing","Math"], correctIndex: 0 },
  { scenario: "Ghost communicates via?", clues: ["Pick."], options: ["Vision cards (illustrations)","Words","Numbers","Sound"], correctIndex: 0 },
  { scenario: "Number of game rounds (max)?", clues: ["Pick."], options: ["7","10","20","3"], correctIndex: 0 },
  { scenario: "What does ghost see?", clues: ["Pick."], options: ["All players' suspect/weapon/room targets","Nothing","Only first player","Random"], correctIndex: 0 },
  { scenario: "Final round vote?", clues: ["Pick."], options: ["Pick correct trio from 3 finalists","Ghost picks","Random draw","No vote"], correctIndex: 0 },
  { scenario: "Players supported?", clues: ["Pick."], options: ["2-7","Solo","8-12","2"], correctIndex: 0 },
  { scenario: "Designers?", clues: ["Pick."], options: ["Oleksandr Nevskiy & Oleg Sidorenko","Bruno Cathala","Reiner Knizia","Antoine Bauza"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2015","2010","2020","2005"], correctIndex: 0 },
  { scenario: "Cooperative or competitive?", clues: ["Pick."], options: ["Cooperative","Competitive only","Hidden traitor","Free-for-all"], correctIndex: 0 },
  { scenario: "Vision card flavor?", clues: ["Pick."], options: ["Surreal art","Photographs","Symbols","Numbers"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: MysteriumVisionsSettings): MysteriumVisionsState {
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

export function reducer(state: MysteriumVisionsState, action: MysteriumVisionsAction): MysteriumVisionsState {
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

export function isTerminal(state: MysteriumVisionsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
