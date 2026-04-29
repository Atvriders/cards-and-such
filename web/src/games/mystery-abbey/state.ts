import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface MysteryAbbeySettings { puzzles: "10"; }

export interface MysteryAbbeyState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type MysteryAbbeyAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Setting of Mystery of the Abbey?", clues: ["Pick."], options: ["Medieval monastery","Egyptian pyramid","Underwater base","Future city"], correctIndex: 0 },
  { scenario: "Each suspect (monk) has attributes.", clues: ["How many traits?"], options: ["Three: order, beard, hood","Two","Five","One"], correctIndex: 0 },
  { scenario: "How do you ask other players for info?", clues: ["Pick."], options: ["Cells / questions","Fight","Shout","Trade"], correctIndex: 0 },
  { scenario: "Mass / silence rule?", clues: ["Pick."], options: ["Round of forced silence","Always silent","No rule","Everyone sings"], correctIndex: 0 },
  { scenario: "Solution components?", clues: ["Pick."], options: ["Suspect monk only","Monk + clue","Murder weapon","Three: who? where? when?"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["3-6","2","8-12","Solo"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Bruno Faidutti","Reiner Knizia","Klaus Teuber","Sid Sackson"], correctIndex: 0 },
  { scenario: "Year of original release?", clues: ["Pick."], options: ["1995","2010","2001","1980"], correctIndex: 0 },
  { scenario: "Number of monk suspects?", clues: ["Pick."], options: ["24","6","12","36"], correctIndex: 0 },
  { scenario: "Win path?", clues: ["Pick."], options: ["Successfully accuse correct monk","Collect 5 robes","Score most","Find Bible"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: MysteryAbbeySettings): MysteryAbbeyState {
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

export function reducer(state: MysteryAbbeyState, action: MysteryAbbeyAction): MysteryAbbeyState {
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

export function isTerminal(state: MysteryAbbeyState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
