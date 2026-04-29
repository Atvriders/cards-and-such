import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface CryptidDeductionSettings { puzzles: "10"; }

export interface CryptidDeductionState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type CryptidDeductionAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Cryptid players each hold a clue.", clues: ["Hidden cryptid cell satisfies?"], options: ["All players' clues","Just one","Majority","First clue"], correctIndex: 0 },
  { scenario: "Asking another player flags a cell.", clues: ["If they place disk, cell does what?"], options: ["Satisfies their clue","Fails their clue","Cryptid","Empty"], correctIndex: 0 },
  { scenario: "When a player places cube, you learn?", clues: ["Pick."], options: ["Cell does not satisfy their clue","Cell satisfies","Cell is cryptid","Random"], correctIndex: 0 },
  { scenario: "Final win action?", clues: ["Pick."], options: ["Search a cell for cryptid","Roll dice","Play card","Vote"], correctIndex: 0 },
  { scenario: "Failed search consequences?", clues: ["Pick."], options: ["Place cube there + that fails clue","Lose game","Lose turn forever","Score -10"], correctIndex: 0 },
  { scenario: "Hex map terrain types?", clues: ["Pick."], options: ["Forest, mountain, swamp, desert, water","Five colors only","Just plains","Two: light/dark"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["3-5","2","6-10","Solo"], correctIndex: 0 },
  { scenario: "Designers?", clues: ["Pick."], options: ["Hal Duncan & Ruth Veevers","Bruno Cathala","Reiner Knizia","Klaus Teuber"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2018","2010","1999","2022"], correctIndex: 0 },
  { scenario: "Optimal first turn?", clues: ["Pick."], options: ["Place pieces and ask informative question","Search immediately","Pass","Trade"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: CryptidDeductionSettings): CryptidDeductionState {
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

export function reducer(state: CryptidDeductionState, action: CryptidDeductionAction): CryptidDeductionState {
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

export function isTerminal(state: CryptidDeductionState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
