import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface ChaosSudokuMiniSettings { puzzles: "8"; }

export interface ChaosSudokuMiniState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type ChaosSudokuMiniAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "4×4 chaos. Box A contains: (1,1),(1,2),(2,1),(2,2). Cell (1,1)=1, (1,2)=2, (2,1)=3. What's (2,2)?",
    "clues": [
      "Box A needs 1-4; has 1,2,3 → missing 4."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 3
  },
  {
    "scenario": "Box B = (1,3)(1,4)(2,3)(2,4). Cell (1,3)=4, (2,3)=1. (1,4)?",
    "clues": [
      "Box missing 2,3. Row 1 has (1,1)=1, (1,2)=2 → row missing 3,4. (1,3)=4 confirms; (1,4) must be 3."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 2
  },
  {
    "scenario": "Now (2,4) in box B (which has 4,1,3). What's (2,4)?",
    "clues": [
      "Box missing 2."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Box C unknown shape. Cell (3,1) row constraint: row 3 has 4 already. Row 3 = [_, 4, _, _]. Col 1 = [1, 3, _, _]. (3,1)?",
    "clues": [
      "Col 1 missing 2,4. Row 3 missing 1,2,3."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "(4,1) given col 1 now [1,3,2,_]. Col missing 4. (4,1)=?",
    "clues": [
      "Forced 4."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 3
  },
  {
    "scenario": "Box A complete (1,2,3,4). Box B complete. Row 3 cells (3,2)(3,3)(3,4) need values 1,3,2 (since 4 placed at (3,2) wait... (3,1)=2). Row 3 missing 1,3,4. Cell (3,2)?",
    "clues": [
      "Already given (3,2)=4."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 3
  },
  {
    "scenario": "Cell (3,3) — row missing 1,3 still. Col 3 has 4,1 from rows 1-2. Col missing 2,3.",
    "clues": [
      "Intersection: 3."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 2
  },
  {
    "scenario": "(3,4) — last cell row 3. Missing digit?",
    "clues": [
      "Row had 2,4,3; missing 1."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 0
  }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: ChaosSudokuMiniSettings): ChaosSudokuMiniState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_PUZZLES], rng).slice(0, Math.min(8, ALL_PUZZLES.length));
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

export function reducer(state: ChaosSudokuMiniState, action: ChaosSudokuMiniAction): ChaosSudokuMiniState {
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

export function isTerminal(state: ChaosSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
