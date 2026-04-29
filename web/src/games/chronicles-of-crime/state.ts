import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface ChroniclesOfCrimeSettings { puzzles: "10"; }

export interface ChroniclesOfCrimeState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type ChroniclesOfCrimeAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Chronicles of Crime needs?", clues: ["Pick."], options: ["Companion phone app","No tech","Only board","Cards only"], correctIndex: 0 },
  { scenario: "VR-style feature?", clues: ["Pick."], options: ["Phone holder for cardboard goggles","No","TV screen","Theater"], correctIndex: 0 },
  { scenario: "Cards represent?", clues: ["Pick."], options: ["Suspects, locations, items","Money","Weapons only","Years"], correctIndex: 0 },
  { scenario: "Win condition?", clues: ["Pick."], options: ["Solve the case correctly","Most points","Vote","No"], correctIndex: 0 },
  { scenario: "Time pressure?", clues: ["Pick."], options: ["Yes, in-game time advances","No","Real-time only","Free"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["David Cicurel","Bruno Cathala","Antoine Bauza","Vlaada Chvátil"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2018","2015","2020","2010"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["1-4","Solo only","6-8","12+"], correctIndex: 0 },
  { scenario: "Cooperative or competitive?", clues: ["Pick."], options: ["Cooperative","Competitive","Hidden traitor","FFA"], correctIndex: 0 },
  { scenario: "Theme variant?", clues: ["Pick."], options: ["Modern London CID","Wild West","Future","Pirates"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: ChroniclesOfCrimeSettings): ChroniclesOfCrimeState {
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

export function reducer(state: ChroniclesOfCrimeState, action: ChroniclesOfCrimeAction): ChroniclesOfCrimeState {
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

export function isTerminal(state: ChroniclesOfCrimeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
