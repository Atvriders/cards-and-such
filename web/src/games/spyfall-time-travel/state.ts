import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface SpyfallTimeTravelSettings { puzzles: "10"; }

export interface SpyfallTimeTravelState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SpyfallTimeTravelAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Spyfall: Time Travel locations are?", clues: ["Pick."], options: ["Eras (Renaissance, Future)","Cities","Movies","Songs"], correctIndex: 0 },
  { scenario: "Each round one player is the spy.", clues: ["Spy goal?"], options: ["Identify the location/era before being caught","Score most","Speak the word","Vote"], correctIndex: 0 },
  { scenario: "Non-spies receive?", clues: ["Pick."], options: ["A role within the era","Same era card without role","Two cards","Nothing"], correctIndex: 0 },
  { scenario: "Win condition for spy?", clues: ["Pick."], options: ["Guess era before timer or remain undiscovered","Highest score","Vote out","Trade"], correctIndex: 0 },
  { scenario: "Game length?", clues: ["Pick."], options: ["~8 minutes per round","30 minutes","Hours","Untimed"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Alexandr Ushan","Bruno Cathala","Reiner Knizia","Klaus Teuber"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2017","2014","2010","2020"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["3-8","2","12","Solo"], correctIndex: 0 },
  { scenario: "Multi-spy variant?", clues: ["Pick."], options: ["Yes, in Spyfall 2 and Time Travel","No","Only original","Solo"], correctIndex: 0 },
  { scenario: "Information channel?", clues: ["Pick."], options: ["Asking each other questions","Cards","Dice","Drawing"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: SpyfallTimeTravelSettings): SpyfallTimeTravelState {
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

export function reducer(state: SpyfallTimeTravelState, action: SpyfallTimeTravelAction): SpyfallTimeTravelState {
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

export function isTerminal(state: SpyfallTimeTravelState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
