import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle {
  given: number[]; // length 25; -1 = blocked, 0 = empty, other = fixed
  solution: number[]; // length 25
}

export interface KurodokoSettings { dummy: boolean; }

export interface KurodokoState {
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
  settings: KurodokoSettings;
}

export type KurodokoAction =
  | { type: "select"; index: number | null }
  | { type: "enter"; value: number }
  | { type: "hint" }
  | { type: "check" }
  | { type: "next" };

export const GRID_ROWS = 5;
export const GRID_COLS = 5;
export const VALUES: readonly number[] = [1,2];
export const VALUE_LABELS: readonly string[] = ["·","■"];

const PUZZLES: Puzzle[] = [
  {
    "given": [
      2,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "solution": [
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2
    ]
  },
  {
    "given": [
      2,
      1,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      1,
      0,
      2,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      1,
      0,
      2
    ],
    "solution": [
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2
    ]
  },
  {
    "given": [
      0,
      0,
      2,
      0,
      0,
      2,
      1,
      0,
      2,
      0,
      2,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0
    ],
    "solution": [
      1,
      2,
      2,
      1,
      1,
      2,
      1,
      1,
      2,
      2,
      2,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      1,
      2,
      1,
      2
    ]
  },
  {
    "given": [
      0,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      2,
      0,
      2,
      0,
      0,
      0,
      0,
      0,
      2,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      2
    ],
    "solution": [
      1,
      2,
      2,
      1,
      1,
      2,
      1,
      1,
      2,
      2,
      2,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      1,
      2,
      1,
      2
    ]
  },
  {
    "given": [
      0,
      0,
      0,
      0,
      2,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      0
    ],
    "solution": [
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      2,
      2
    ]
  },
  {
    "given": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      2,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "solution": [
      1,
      2,
      2,
      1,
      1,
      2,
      1,
      1,
      2,
      2,
      2,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      1,
      2,
      1,
      2
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

export function initialState(seed: number, settings: KurodokoSettings): KurodokoState {
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

export function reducer(state: KurodokoState, action: KurodokoAction): KurodokoState {
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

export function isTerminal(state: KurodokoState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
