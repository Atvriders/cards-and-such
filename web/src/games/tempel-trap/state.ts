import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface TempelTrapSettings { puzzles: "10"; }

export interface TempelTrapState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type TempelTrapAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Adventurers play to find Gold. Guards play to slow.", clues: ["Card types?"], options: ["Gold/Trap/Empty","Red/Blue","Numbered","Rules cards"], correctIndex: 0 },
  { scenario: "Game ends when adventurers reveal all gold OR?", clues: ["Pick."], options: ["All traps revealed","Time runs out","Trap counter hits 0","Round 4 ends"], correctIndex: 3 },
  { scenario: "Hidden role at start.", clues: ["Each player is?"], options: ["Adventurer or Guard","One of three","Wizard","Cooperative"], correctIndex: 0 },
  { scenario: "Cards per player per round?", clues: ["Pick."], options: ["3","5","Same as round number","Variable"], correctIndex: 1 },
  { scenario: "A flipped Gold card publicly does what?", clues: ["Pick."], options: ["Counts toward win","Goes back to hand","Nothing","Reveals role"], correctIndex: 0 },
  { scenario: "Bluffing: a Guard wants?", clues: ["Pick."], options: ["To get adventurers to flip traps","To find gold","To stay neutral","Coop"], correctIndex: 0 },
  { scenario: "Trap in this game does?", clues: ["Pick."], options: ["Loses adventurer side","Equal to guard win","Flipped trap counts toward guard win","Removes player"], correctIndex: 2 },
  { scenario: "Number of players supported?", clues: ["Pick."], options: ["3-10","2","8 only","12+"], correctIndex: 0 },
  { scenario: "Information per round comes from?", clues: ["Pick."], options: ["Card counts in hands","Spoken negotiation","Both reveals + chatter","Coin flips"], correctIndex: 2 },
  { scenario: "Tempel des Schreckens publisher year?", clues: ["Pick."], options: ["2014","1990","2005","2020"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: TempelTrapSettings): TempelTrapState {
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

export function reducer(state: TempelTrapState, action: TempelTrapAction): TempelTrapState {
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

export function isTerminal(state: TempelTrapState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
