import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle {
  given: number[]; // length 16; -1 = blocked, 0 = empty, other = fixed
  solution: number[]; // length 16
}

export interface NumbrixMiniSettings { dummy: boolean; }

export interface NumbrixMiniState {
  puzzles: Puzzle[];
  idx: number;
  current: number[];
  selected: number | null;
  errors: number[];
  hintsUsed: number;
  movesMade: number;
  solved: boolean;
  totalSolved: number;
  score: number;
  phase: "playing" | "done";
  settings: NumbrixMiniSettings;
}

export type NumbrixMiniAction =
  | { type: "select"; index: number | null }
  | { type: "enter"; value: number }
  | { type: "hint" }
  | { type: "check" }
  | { type: "next" };

export const GRID_ROWS = 4;
export const GRID_COLS = 4;
export const VALUES: readonly number[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
export const VALUE_LABELS: readonly string[] = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];

const PUZZLES: Puzzle[] = [
  {
    "given": [
      1,
      2,
      3,
      0,
      12,
      0,
      0,
      5,
      11,
      0,
      15,
      0,
      0,
      9,
      0,
      7
    ],
    "solution": [
      1,
      2,
      3,
      4,
      12,
      13,
      14,
      5,
      11,
      16,
      15,
      6,
      10,
      9,
      8,
      7
    ]
  },
  {
    "given": [
      1,
      2,
      0,
      4,
      12,
      0,
      14,
      0,
      0,
      16,
      0,
      0,
      0,
      0,
      8,
      0
    ],
    "solution": [
      1,
      2,
      3,
      4,
      12,
      13,
      14,
      5,
      11,
      16,
      15,
      6,
      10,
      9,
      8,
      7
    ]
  },
  {
    "given": [
      0,
      3,
      0,
      1,
      0,
      0,
      0,
      16,
      6,
      0,
      0,
      0,
      0,
      8,
      0,
      10
    ],
    "solution": [
      4,
      3,
      2,
      1,
      5,
      14,
      15,
      16,
      6,
      13,
      12,
      11,
      7,
      8,
      9,
      10
    ]
  },
  {
    "given": [
      0,
      3,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      13,
      0,
      11,
      0,
      0,
      9,
      0
    ],
    "solution": [
      4,
      3,
      2,
      1,
      5,
      14,
      15,
      16,
      6,
      13,
      12,
      11,
      7,
      8,
      9,
      10
    ]
  },
  {
    "given": [
      1,
      16,
      15,
      0,
      0,
      5,
      0,
      0,
      3,
      0,
      0,
      0,
      8,
      9,
      10,
      0
    ],
    "solution": [
      1,
      16,
      15,
      14,
      2,
      5,
      6,
      13,
      3,
      4,
      7,
      12,
      8,
      9,
      10,
      11
    ]
  },
  {
    "given": [
      1,
      0,
      15,
      0,
      2,
      5,
      6,
      0,
      3,
      0,
      7,
      0,
      0,
      0,
      0,
      11
    ],
    "solution": [
      1,
      16,
      15,
      14,
      2,
      5,
      6,
      13,
      3,
      4,
      7,
      12,
      8,
      9,
      10,
      11
    ]
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

export function initialState(seed: number, settings: NumbrixMiniSettings): NumbrixMiniState {
  const rng = mulberry32(seed);
  const puzzles = shuffle(PUZZLES, rng);
  return {
    puzzles,
    idx: 0,
    current: [...puzzles[0]!.given],
    selected: null,
    errors: [],
    hintsUsed: 0,
    movesMade: 0,
    solved: false,
    totalSolved: 0,
    score: 0,
    phase: "playing",
    settings,
  };
}

export function validate(current: number[], solution: number[]): number[] {
  const errs: number[] = [];
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== 0 && current[i] !== -1 && current[i] !== solution[i]) errs.push(i);
  }
  return errs;
}

function isComplete(current: number[], solution: number[]): boolean {
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== solution[i]) return false;
  }
  return true;
}

export function reducer(state: NumbrixMiniState, action: NumbrixMiniAction): NumbrixMiniState {
  if (state.phase === "done") return state;
  const puzzle = state.puzzles[state.idx]!;

  switch (action.type) {
    case "select":
      return { ...state, selected: action.index, errors: [] };

    case "enter": {
      if (state.selected === null || state.solved) return state;
      const g = puzzle.given[state.selected]!;
      if (g !== 0) return state;
      const next = [...state.current];
      next[state.selected] = action.value;
      const solved = isComplete(next, puzzle.solution);
      return {
        ...state,
        current: next,
        movesMade: state.movesMade + 1,
        solved,
        score: solved ? state.score + Math.max(50, 200 - state.hintsUsed * 30) : state.score,
        totalSolved: solved ? state.totalSolved + 1 : state.totalSolved,
        errors: [],
      };
    }

    case "hint": {
      if (state.solved) return state;
      const empty: number[] = [];
      for (let i = 0; i < state.current.length; i++) {
        if (puzzle.given[i] === 0 && state.current[i] !== puzzle.solution[i]) empty.push(i);
      }
      if (empty.length === 0) return state;
      const idx = empty[0]!;
      const next = [...state.current];
      next[idx] = puzzle.solution[idx]!;
      const solved = isComplete(next, puzzle.solution);
      return {
        ...state,
        current: next,
        hintsUsed: state.hintsUsed + 1,
        movesMade: state.movesMade + 1,
        solved,
        score: solved ? state.score + Math.max(50, 200 - state.hintsUsed * 30) : state.score,
        totalSolved: solved ? state.totalSolved + 1 : state.totalSolved,
        errors: [],
      };
    }

    case "check":
      return { ...state, errors: validate(state.current, puzzle.solution) };

    case "next": {
      const ni = state.idx + 1;
      if (ni >= state.puzzles.length) return { ...state, phase: "done" };
      return {
        ...state,
        idx: ni,
        current: [...state.puzzles[ni]!.given],
        selected: null,
        errors: [],
        solved: false,
        hintsUsed: 0,
        movesMade: 0,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: NumbrixMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
