import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle {
  given: number[]; // length 36
  solution: number[]; // length 36
}

export interface SudokuMini6x6Settings { dummy: boolean; }

export interface SudokuMini6x6State {
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
  settings: SudokuMini6x6Settings;
}

export type SudokuMini6x6Action =
  | { type: "select"; index: number | null }
  | { type: "enter"; digit: number }
  | { type: "hint" }
  | { type: "check" }
  | { type: "next" };

export const GRID_SIZE = 6;
export const MAX_DIGIT = 6;
export const BOX_ROWS = 2;
export const BOX_COLS = 3;

const PUZZLES: Puzzle[] = [
  {
    "given": [
      1,
      0,
      0,
      4,
      0,
      6,
      0,
      5,
      6,
      0,
      2,
      0,
      2,
      0,
      1,
      0,
      0,
      4,
      5,
      0,
      0,
      2,
      0,
      1,
      0,
      1,
      0,
      6,
      4,
      0,
      6,
      0,
      5,
      0,
      0,
      2
    ],
    "solution": [
      1,
      2,
      3,
      4,
      5,
      6,
      4,
      5,
      6,
      1,
      2,
      3,
      2,
      3,
      1,
      5,
      6,
      4,
      5,
      6,
      4,
      2,
      3,
      1,
      3,
      1,
      2,
      6,
      4,
      5,
      6,
      4,
      5,
      3,
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
      5,
      0,
      4,
      0,
      0,
      1,
      0,
      3,
      0,
      3,
      0,
      5,
      0,
      0,
      0,
      0,
      4,
      0,
      3,
      0,
      3,
      0,
      2,
      0,
      0,
      5,
      0,
      4,
      0,
      3,
      0,
      0
    ],
    "solution": [
      1,
      2,
      3,
      4,
      5,
      6,
      4,
      5,
      6,
      1,
      2,
      3,
      2,
      3,
      1,
      5,
      6,
      4,
      5,
      6,
      4,
      2,
      3,
      1,
      3,
      1,
      2,
      6,
      4,
      5,
      6,
      4,
      5,
      3,
      1,
      2
    ]
  },
  {
    "given": [
      2,
      0,
      1,
      0,
      0,
      6,
      0,
      6,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      6,
      0,
      0,
      5,
      0,
      0,
      0,
      3,
      0,
      0,
      2,
      0,
      5,
      0,
      6,
      0,
      0,
      3,
      0,
      0
    ],
    "solution": [
      2,
      3,
      1,
      5,
      4,
      6,
      5,
      6,
      4,
      1,
      3,
      2,
      1,
      2,
      3,
      4,
      6,
      5,
      4,
      5,
      6,
      2,
      1,
      3,
      3,
      1,
      2,
      6,
      5,
      4,
      6,
      4,
      5,
      3,
      2,
      1
    ]
  },
  {
    "given": [
      0,
      3,
      0,
      5,
      0,
      0,
      5,
      0,
      4,
      0,
      3,
      0,
      0,
      0,
      3,
      0,
      0,
      5,
      4,
      0,
      0,
      2,
      0,
      0,
      0,
      1,
      0,
      0,
      5,
      0,
      0,
      0,
      5,
      0,
      0,
      1
    ],
    "solution": [
      2,
      3,
      1,
      5,
      4,
      6,
      5,
      6,
      4,
      1,
      3,
      2,
      1,
      2,
      3,
      4,
      6,
      5,
      4,
      5,
      6,
      2,
      1,
      3,
      3,
      1,
      2,
      6,
      5,
      4,
      6,
      4,
      5,
      3,
      2,
      1
    ]
  },
  {
    "given": [
      1,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      6,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      6,
      4,
      5,
      6,
      0,
      0,
      0,
      0,
      0,
      0,
      2,
      6,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      2
    ],
    "solution": [
      1,
      2,
      3,
      4,
      5,
      6,
      4,
      5,
      6,
      1,
      2,
      3,
      2,
      3,
      1,
      5,
      6,
      4,
      5,
      6,
      4,
      2,
      3,
      1,
      3,
      1,
      2,
      6,
      4,
      5,
      6,
      4,
      5,
      3,
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
      4,
      6,
      0,
      0,
      4,
      1,
      0,
      0,
      1,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      3,
      0,
      0,
      2,
      6,
      0,
      0,
      6,
      4,
      0,
      0,
      0,
      0
    ],
    "solution": [
      2,
      3,
      1,
      5,
      4,
      6,
      5,
      6,
      4,
      1,
      3,
      2,
      1,
      2,
      3,
      4,
      6,
      5,
      4,
      5,
      6,
      2,
      1,
      3,
      3,
      1,
      2,
      6,
      5,
      4,
      6,
      4,
      5,
      3,
      2,
      1
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

export function initialState(seed: number, settings: SudokuMini6x6Settings): SudokuMini6x6State {
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
    if (current[i] !== 0 && current[i] !== solution[i]) errs.push(i);
  }
  return errs;
}

function isComplete(current: number[], solution: number[]): boolean {
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== solution[i]) return false;
  }
  return true;
}

export function reducer(state: SudokuMini6x6State, action: SudokuMini6x6Action): SudokuMini6x6State {
  if (state.phase === "done") return state;
  const puzzle = state.puzzles[state.idx]!;

  switch (action.type) {
    case "select":
      return { ...state, selected: action.index, errors: [] };

    case "enter": {
      if (state.selected === null || state.solved) return state;
      if (puzzle.given[state.selected] !== 0) return state;
      const next = [...state.current];
      next[state.selected] = action.digit;
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

export function isTerminal(state: SudokuMini6x6State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
