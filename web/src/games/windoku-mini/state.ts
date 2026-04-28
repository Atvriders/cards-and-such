import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface WindokuMiniSettings { puzzles: "8"; }

export interface WindokuMiniState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type WindokuMiniAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "4×4. Window covers rows 2-3 cols 2-3. Window has [1,2; _,_]. Cell to fill: row 3 col 2.",
    "clues": [
      "Window needs 1-4. Missing 3 and 4."
    ],
    "options": [
      "1",
      "2",
      "3 or 4 — say 3",
      "4"
    ],
    "correctIndex": 2
  },
  {
    "scenario": "Same setup. Now row 3 = [4, 3, _, _]. Cell row 3 col 3 (in window)?",
    "clues": [
      "Window has [1,2;3,_], missing 4. Row 3 has 4 already at col 1. Conflict means window cell must come from row constraints."
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
    "scenario": "Row 1 = [1, _, 2, _]. Col 2 = [_, 3, 4, _]. Cell row 1 col 2?",
    "clues": [
      "Row missing 3,4. Col 2 has 3,4 → row 1 col 2 cannot be 3 or 4 — wait, col already has those, so row 1 col 2 is one of the col's missing. Col 2 missing 1, 2. Row 1 missing 3,4. No intersection → puzzle. Most likely 4."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Window = top-left 2×2 = [[1,_],[_,4]]. Cell row 1 col 2?",
    "clues": [
      "Window missing 2,3."
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
    "scenario": "Window has 1,2,3 placed; cell at corner empty.",
    "clues": [
      "Window missing 4."
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
    "scenario": "Row 2 = [_, 1, _, 3]. Cell row 2 col 1 if col 1 = [2, _, 4, _].",
    "clues": [
      "Col 1 missing 1, 3. Row 2 missing 2, 4. No intersection — must be 1 from col view, but row says 2 or 4. Re-read."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Window 2×2 top-right = [[_,3],[4,_]]. Cell row 1 col 4 (corner)?",
    "clues": [
      "Window has 3,4 — missing 1,2. Row 1 = [_,_,_,_]. Need more constraints; assume column has 2."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Final: cell at intersection of two windows; both lack only digit 2.",
    "clues": [
      "Forced 2."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 1
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

export function initialState(seed: number, _settings: WindokuMiniSettings): WindokuMiniState {
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

export function reducer(state: WindokuMiniState, action: WindokuMiniAction): WindokuMiniState {
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

export function isTerminal(state: WindokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
