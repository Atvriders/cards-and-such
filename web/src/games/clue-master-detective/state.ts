import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface ClueMasterDetectiveSettings { puzzles: "10"; }

export interface ClueMasterDetectiveState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type ClueMasterDetectiveAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Clue Master Detective adds suspects beyond the original 6.", clues: ["Total suspects?"], options: ["10","8","12","6"], correctIndex: 0 },
  { scenario: "Number of rooms?", clues: ["Pick."], options: ["9","12","6","15"], correctIndex: 1 },
  { scenario: "Number of weapons?", clues: ["Pick."], options: ["6","8","10","12"], correctIndex: 1 },
  { scenario: "Total cards in solution?", clues: ["Pick."], options: ["3","6","9","1"], correctIndex: 0 },
  { scenario: "Deduction style is?", clues: ["Pick."], options: ["Process of elimination","Math equations","Word puzzles","Drawing"], correctIndex: 0 },
  { scenario: "Win condition?", clues: ["Pick."], options: ["Make accusation matching envelope","Roll a 6","Land in study","Find clue card"], correctIndex: 0 },
  { scenario: "Wrong accusation penalty?", clues: ["Pick."], options: ["Lose game","-10 points","Skip turn","Take a card"], correctIndex: 0 },
  { scenario: "Hallway shortcut new in this edition?", clues: ["Pick."], options: ["No, secret passages instead","Yes, 4 corner shortcuts","Roller-coaster room","Cards"], correctIndex: 1 },
  { scenario: "Players supported?", clues: ["Pick."], options: ["3-6","3-10","2","8"], correctIndex: 1 },
  { scenario: "Year released?", clues: ["Pick."], options: ["1988","1949","2000","1976"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: ClueMasterDetectiveSettings): ClueMasterDetectiveState {
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

export function reducer(state: ClueMasterDetectiveState, action: ClueMasterDetectiveAction): ClueMasterDetectiveState {
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

export function isTerminal(state: ClueMasterDetectiveState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
