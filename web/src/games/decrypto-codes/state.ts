import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface DecryptoCodesSettings { puzzles: "10"; }

export interface DecryptoCodesState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type DecryptoCodesAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Each team has 4 secret words.", clues: ["Encryptor sends?"], options: ["3-digit code (1-4)","Word list","Clue picture","Color"], correctIndex: 0 },
  { scenario: "Clues match word numbers e.g. 4-2-1.", clues: ["Goal?"], options: ["Own team decodes; opposing intercepts","Points","Win streak","Pass"], correctIndex: 0 },
  { scenario: "Win condition?", clues: ["Pick."], options: ["Opposing team gets 2 interceptions OR you fail 2 transmissions","First to 7","No errors","Always"], correctIndex: 0 },
  { scenario: "Number of clues per team-turn?", clues: ["Pick."], options: ["3 (one per code digit)","1","4","Variable"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Thomas Dagenais-Lespérance","Bruno Cathala","Reiner Knizia","Antoine Bauza"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2018","2010","2022","2005"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["3-8","2","Solo","12+"], correctIndex: 0 },
  { scenario: "First-round risk?", clues: ["Pick."], options: ["Round 1: no penalty for interception","Always penalty","No risk","Endless"], correctIndex: 0 },
  { scenario: "Strategic clue style?", clues: ["Pick."], options: ["Personal connections opaque to enemies","Direct synonyms","Random words","Numbers"], correctIndex: 0 },
  { scenario: "Difficulty curve?", clues: ["Pick."], options: ["Harder each round (less ambiguity)","Easier","Static","Reset"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: DecryptoCodesSettings): DecryptoCodesState {
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

export function reducer(state: DecryptoCodesState, action: DecryptoCodesAction): DecryptoCodesState {
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

export function isTerminal(state: DecryptoCodesState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
