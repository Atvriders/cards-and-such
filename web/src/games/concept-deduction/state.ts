import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface ConceptDeductionSettings { puzzles: "10"; }

export interface ConceptDeductionState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type ConceptDeductionAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  { scenario: "Concept board has 100+ icons.", clues: ["How do clue-givers signal?"], options: ["Place pawns on icons","Speak words","Draw","Sing"], correctIndex: 0 },
  { scenario: "Main concept marker?", clues: ["Pick."], options: ["Question-mark pawn","Score chip","Card","Token"], correctIndex: 0 },
  { scenario: "Sub-concepts?", clues: ["Pick."], options: ["Numbered cubes","Same pawn","No","Card flips"], correctIndex: 0 },
  { scenario: "Players who guess scored?", clues: ["Pick."], options: ["Yes, both guesser and clue-giver score","Only guesser","Only clue-giver","No score"], correctIndex: 0 },
  { scenario: "Word categories?", clues: ["Pick."], options: ["Easy / hard","Verbs only","Movies","Numbers"], correctIndex: 0 },
  { scenario: "Player count?", clues: ["Pick."], options: ["4-12","2","Solo","20+"], correctIndex: 0 },
  { scenario: "Designer?", clues: ["Pick."], options: ["Beauchêne & Rivollet","Knizia","Klaus Teuber","Wolfgang Warsch"], correctIndex: 0 },
  { scenario: "Year?", clues: ["Pick."], options: ["2013","2000","2020","1995"], correctIndex: 0 },
  { scenario: "Icon count on board?", clues: ["Pick."], options: ["~117","50","250","9"], correctIndex: 0 },
  { scenario: "Communication restriction?", clues: ["Pick."], options: ["Only via icon placement","Free speech","Whispering","Writing"], correctIndex: 0 }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: ConceptDeductionSettings): ConceptDeductionState {
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

export function reducer(state: ConceptDeductionState, action: ConceptDeductionAction): ConceptDeductionState {
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

export function isTerminal(state: ConceptDeductionState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
