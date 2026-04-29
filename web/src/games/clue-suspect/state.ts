import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface ClueSuspectSettings { puzzles: "10"; }

export interface ClueSuspectState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type ClueSuspectAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Clue Suspect uses just cards (no board).", clues: ["Tile / room representation?"], options: ["Card","Big board","Phone app","Spinners"], correctIndex: 0 },
  { scenario: "Each player draws hand of 6 cards in 4-player game.", clues: ["Cards left in suspect pile?"], options: ["Solution stays hidden","All revealed","None","Reshuffled mid-game"], correctIndex: 0 },
  { scenario: "Type of action card?", clues: ["Pick."], options: ["Question/answer reveal cards","Movement","Trap","Score"], correctIndex: 0 },
  { scenario: "Goal of game?", clues: ["Pick."], options: ["Solve who, what, where","Roll low","Collect 6 sets","Gain coins"], correctIndex: 0 },
  { scenario: "Suspect cards count in deck?", clues: ["Pick."], options: ["6","12","9","20"], correctIndex: 0 },
  { scenario: "Game length compared to Clue?", clues: ["Pick."], options: ["Faster (~20m)","Same","Longer","No fixed time"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["3-10","6 only","2","12+"], correctIndex: 0 },
  { scenario: "Information from opponents?", clues: ["Pick."], options: ["When they answer questions, you cross off","Never","Random","Coin flip"], correctIndex: 0 },
  { scenario: "Win condition for accusation?", clues: ["Pick."], options: ["Match all three solution cards","Match weapon","Match room","First to ask 5 questions"], correctIndex: 0 },
  { scenario: "Released year?", clues: ["Pick."], options: ["2017","1995","2000","2023"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: ClueSuspectSettings): ClueSuspectState {
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

export function reducer(state: ClueSuspectState, action: ClueSuspectAction): ClueSuspectState {
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

export function isTerminal(state: ClueSuspectState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
