import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface DeadlyDowagersSettings { puzzles: "10"; }

export interface DeadlyDowagersState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type DeadlyDowagersAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Deadly Dowagers theme?", clues: ["Pick."], options: ["Victorian widow heir-collecting","Pirate","Sci-fi","Cyberpunk"], correctIndex: 0 },
  { scenario: "Game mechanic?", clues: ["Pick."], options: ["Hidden role murder + deduction","Drafting","Auction","Tile placement"], correctIndex: 0 },
  { scenario: "Each player conceals?", clues: ["Pick."], options: ["Their husbands","Score","Cards","Money"], correctIndex: 0 },
  { scenario: "Win condition?", clues: ["Pick."], options: ["Most inheritance scored","First to 5 husbands","Single accusation","Time"], correctIndex: 0 },
  { scenario: "Game type?", clues: ["Pick."], options: ["Card game","Board game","Roll-and-write","Co-op"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Independent indie team","Reiner Knizia","Klaus Teuber","Bruno Cathala"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2014","1995","2022","2008"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["2-5","2","8+","Solo"], correctIndex: 0 },
  { scenario: "Tone?", clues: ["Pick."], options: ["Dark humor","Educational","Children's","Serious"], correctIndex: 0 },
  { scenario: "Replayability driver?", clues: ["Pick."], options: ["Random hidden info","Fixed map","No randomness","Static"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: DeadlyDowagersSettings): DeadlyDowagersState {
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

export function reducer(state: DeadlyDowagersState, action: DeadlyDowagersAction): DeadlyDowagersState {
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

export function isTerminal(state: DeadlyDowagersState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
