import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface BlackBoxMiniSettings { puzzles: "8"; }

export interface BlackBoxMiniState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type BlackBoxMiniAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "5x5 grid (rows 1-5, cols 1-5). Find the single atom.",
    "clues": [
      "A ray fired from row 3 left side reaches the right side absorbed (hits atom).",
      "A ray fired from col 3 top deflects 90° to the right at column 4."
    ],
    "options": [
      "row 3, col 3",
      "row 3, col 4",
      "row 2, col 3",
      "row 4, col 4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "5x5 grid; one atom.",
    "clues": [
      "Ray from top of col 2: passes straight through to bottom.",
      "Ray from left of row 4: absorbed."
    ],
    "options": [
      "row 4, col 2",
      "row 4, col 3",
      "row 4, col 5",
      "row 2, col 4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Find the atom.",
    "clues": [
      "Ray from left of row 1 reflects back out at row 1 (atom at corner-adjacent).",
      "Ray from top of col 1: passes straight through."
    ],
    "options": [
      "row 2, col 2",
      "row 2, col 1",
      "row 1, col 2",
      "row 3, col 3"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Find the hidden atom.",
    "clues": [
      "Ray from top col 5: deflects left exits at row 1, col 4.",
      "Ray from left row 5: absorbed."
    ],
    "options": [
      "row 5, col 4",
      "row 4, col 5",
      "row 5, col 3",
      "row 3, col 4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Single atom hidden somewhere.",
    "clues": [
      "Ray from top col 3: deflects right at column 4 exits row 1, col 5? Actually exits at row 4, col 5.",
      "Ray from bottom col 1: passes straight through."
    ],
    "options": [
      "row 4, col 4",
      "row 4, col 3",
      "row 3, col 4",
      "row 2, col 2"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Find atom.",
    "clues": [
      "Ray from left row 2: absorbed at col 5.",
      "Ray from top col 5: deflects left exits at row 1 col 4."
    ],
    "options": [
      "row 2, col 5",
      "row 2, col 4",
      "row 3, col 5",
      "row 1, col 5"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Hidden atom.",
    "clues": [
      "Ray from top col 4: passes straight through.",
      "Ray from left row 3: deflects up exits col 2 top."
    ],
    "options": [
      "row 4, col 1",
      "row 4, col 2",
      "row 3, col 2",
      "row 2, col 4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Final puzzle.",
    "clues": [
      "Ray from bottom col 2: absorbed.",
      "Ray from left row 1: passes straight to right side row 1."
    ],
    "options": [
      "row 5, col 2",
      "row 4, col 2",
      "row 3, col 2",
      "row 2, col 2"
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

export function initialState(seed: number, _settings: BlackBoxMiniSettings): BlackBoxMiniState {
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

export function reducer(state: BlackBoxMiniState, action: BlackBoxMiniAction): BlackBoxMiniState {
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

export function isTerminal(state: BlackBoxMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
