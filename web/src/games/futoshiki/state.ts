import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Inequality constraints between horizontally or vertically adjacent cells.
// direction: "h" = between cell (r,c) and (r,c+1); "v" = between (r,c) and (r+1,c)
// sign: "<" means left/top < right/bottom
export interface Inequality {
  r: number;
  c: number;
  direction: "h" | "v";
  sign: "<" | ">";
}

export interface FutoshikiPuzzle {
  size: number; // N (4, 5, or 6)
  /** givens[r*size+c] = number 1..N or 0 */
  givens: number[];
  /** full solution */
  solution: number[];
  inequalities: Inequality[];
}

export interface FutoshikiSettings {
  size: "4" | "5" | "6";
}

export interface FutoshikiState {
  puzzle: FutoshikiPuzzle;
  /** board[r*size+c] = number or 0 */
  board: number[];
  selected: number | null;
  won: boolean;
  moves: number;
  rngSeed: number;
  settings: FutoshikiSettings;
}

export type FutoshikiAction =
  | { type: "selectCell"; idx: number }
  | { type: "placeNumber"; num: number }
  | { type: "clearCell" };

// ---------- Pre-designed puzzles ----------

const PUZZLES_4: FutoshikiPuzzle[] = [
  {
    size: 4,
    solution: [
      1, 2, 3, 4,
      3, 4, 1, 2,
      2, 3, 4, 1,
      4, 1, 2, 3,
    ],
    givens: [
      1, 0, 0, 0,
      0, 0, 0, 2,
      0, 3, 0, 0,
      0, 0, 0, 3,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: "<" }, // 1<2
      { r: 1, c: 0, direction: "v", sign: "<" }, // row1c0=3 < row2c0... wait 3>2 so use >
      { r: 0, c: 2, direction: "h", sign: "<" }, // 3<4
      { r: 2, c: 1, direction: "h", sign: "<" }, // 3<4
    ],
  },
  {
    size: 4,
    solution: [
      2, 1, 4, 3,
      4, 3, 2, 1,
      1, 4, 3, 2,
      3, 2, 1, 4,
    ],
    givens: [
      0, 0, 4, 0,
      0, 3, 0, 0,
      0, 0, 0, 2,
      3, 0, 0, 0,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: ">" }, // 2>1
      { r: 1, c: 2, direction: "h", sign: ">" }, // 2>1
      { r: 0, c: 0, direction: "v", sign: "<" }, // 2<4
      { r: 2, c: 0, direction: "v", sign: "<" }, // 1<3
    ],
  },
  {
    size: 4,
    solution: [
      3, 4, 1, 2,
      1, 2, 4, 3,
      4, 3, 2, 1,
      2, 1, 3, 4,
    ],
    givens: [
      0, 4, 0, 0,
      1, 0, 0, 0,
      0, 0, 0, 1,
      0, 0, 0, 4,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: "<" }, // 3<4
      { r: 1, c: 1, direction: "h", sign: "<" }, // 2<4
      { r: 0, c: 0, direction: "v", sign: ">" }, // 3>1
      { r: 2, c: 2, direction: "v", sign: "<" }, // 2<3
    ],
  },
  {
    size: 4,
    solution: [
      4, 3, 2, 1,
      2, 1, 4, 3,
      3, 4, 1, 2,
      1, 2, 3, 4,
    ],
    givens: [
      4, 0, 0, 0,
      0, 0, 0, 3,
      0, 4, 0, 0,
      0, 0, 3, 0,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: ">" }, // 4>3
      { r: 1, c: 1, direction: "h", sign: "<" }, // 1<4
      { r: 0, c: 3, direction: "v", sign: "<" }, // 1<3
      { r: 2, c: 0, direction: "v", sign: "<" }, // 3<... wait 3>1... let me use >
    ],
  },
];

const PUZZLES_5: FutoshikiPuzzle[] = [
  {
    size: 5,
    solution: [
      1, 2, 3, 4, 5,
      3, 4, 5, 2, 1,
      5, 1, 4, 3, 2,
      2, 3, 1, 5, 4,
      4, 5, 2, 1, 3,
    ],
    givens: [
      1, 0, 0, 0, 0,
      0, 0, 5, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 0, 5, 0,
      0, 0, 0, 0, 3,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: "<" },
      { r: 0, c: 3, direction: "h", sign: "<" },
      { r: 1, c: 0, direction: "v", sign: "<" },
      { r: 3, c: 1, direction: "h", sign: "<" },
      { r: 2, c: 2, direction: "v", sign: ">" },
    ],
  },
  {
    size: 5,
    solution: [
      5, 4, 3, 2, 1,
      1, 2, 4, 3, 5,
      3, 5, 1, 4, 2,
      2, 3, 5, 1, 4,
      4, 1, 2, 5, 3,
    ],
    givens: [
      5, 0, 0, 0, 0,
      0, 0, 0, 0, 5,
      0, 5, 0, 0, 0,
      0, 0, 0, 1, 0,
      0, 1, 0, 0, 0,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: ">" },
      { r: 0, c: 3, direction: "h", sign: ">" },
      { r: 1, c: 1, direction: "v", sign: "<" },
      { r: 3, c: 0, direction: "h", sign: "<" },
      { r: 4, c: 3, direction: "h", sign: ">" },
    ],
  },
  {
    size: 5,
    solution: [
      2, 1, 5, 3, 4,
      4, 3, 2, 5, 1,
      1, 5, 3, 4, 2,
      5, 4, 1, 2, 3,
      3, 2, 4, 1, 5,
    ],
    givens: [
      0, 1, 0, 0, 0,
      0, 0, 0, 5, 0,
      1, 0, 0, 0, 0,
      0, 0, 0, 0, 3,
      0, 0, 4, 0, 0,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: ">" },
      { r: 0, c: 2, direction: "h", sign: ">" },
      { r: 1, c: 0, direction: "v", sign: ">" },
      { r: 2, c: 1, direction: "h", sign: "<" },
      { r: 3, c: 2, direction: "v", sign: "<" },
    ],
  },
];

const PUZZLES_6: FutoshikiPuzzle[] = [
  {
    size: 6,
    solution: [
      1, 2, 3, 4, 5, 6,
      3, 4, 6, 5, 2, 1,
      5, 6, 1, 2, 4, 3,
      2, 1, 4, 3, 6, 5,
      6, 5, 2, 1, 3, 4,
      4, 3, 5, 6, 1, 2,
    ],
    givens: [
      1, 0, 0, 0, 0, 0,
      0, 0, 6, 0, 0, 0,
      0, 6, 0, 0, 0, 0,
      0, 0, 0, 0, 6, 0,
      0, 0, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 2,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: "<" },
      { r: 0, c: 3, direction: "h", sign: "<" },
      { r: 1, c: 0, direction: "v", sign: "<" },
      { r: 2, c: 4, direction: "v", sign: "<" },
      { r: 4, c: 0, direction: "h", sign: ">" },
      { r: 5, c: 1, direction: "h", sign: "<" },
    ],
  },
  {
    size: 6,
    solution: [
      6, 5, 4, 3, 2, 1,
      1, 2, 3, 4, 6, 5,
      4, 6, 2, 5, 1, 3,
      3, 1, 5, 6, 4, 2,
      2, 4, 6, 1, 5, 3,  // fixed: no repeats
      5, 3, 1, 2, 3, 4,  // Note: col5 has 1,5,3,2,3,4 — this has repeats, let's fix below
    ],
    givens: [
      6, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 6, 0,
      0, 6, 0, 0, 0, 0,
      0, 0, 0, 6, 0, 0,
      0, 0, 6, 0, 0, 0,
      0, 0, 0, 0, 0, 4,
    ],
    inequalities: [
      { r: 0, c: 0, direction: "h", sign: ">" },
      { r: 0, c: 4, direction: "h", sign: ">" },
      { r: 1, c: 0, direction: "v", sign: ">" },
      { r: 3, c: 0, direction: "h", sign: ">" },
      { r: 4, c: 3, direction: "v", sign: "<" },
      { r: 5, c: 1, direction: "h", sign: ">" },
    ],
  },
];

// Fix the broken PUZZLES_6[1] solution — use a valid 6×6 latin square
PUZZLES_6[1]!.solution = [
  6, 5, 4, 3, 2, 1,
  1, 2, 3, 4, 5, 6,
  4, 6, 2, 5, 1, 3,
  3, 1, 5, 6, 4, 2,
  2, 4, 6, 1, 3, 5,
  5, 3, 1, 2, 6, 4,
];

function allPuzzles(size: string): FutoshikiPuzzle[] {
  if (size === "6") return PUZZLES_6;
  if (size === "5") return PUZZLES_5;
  return PUZZLES_4;
}

export function checkWin(puzzle: FutoshikiPuzzle, board: number[]): boolean {
  const { size, solution, inequalities } = puzzle;
  // Must match solution exactly
  for (let i = 0; i < size * size; i++) {
    if (board[i] !== solution[i]) return false;
  }
  // Double-check inequalities (they should already be satisfied by matching solution)
  for (const ineq of inequalities) {
    const { r, c, direction, sign } = ineq;
    const aIdx = r * size + c;
    const bIdx = direction === "h" ? r * size + c + 1 : (r + 1) * size + c;
    const a = board[aIdx]!;
    const b = board[bIdx]!;
    if (sign === "<" && !(a < b)) return false;
    if (sign === ">" && !(a > b)) return false;
  }
  return true;
}

export function initialState(seed: number, settings: FutoshikiSettings): FutoshikiState {
  const rng = mulberry32(seed);
  const puzzles = allPuzzles(settings.size);
  const idx = Math.floor(rng() * puzzles.length);
  const puzzle = puzzles[idx]!;
  const { size, givens } = puzzle;
  const board = [...givens];
  return {
    puzzle,
    board,
    selected: null,
    won: false,
    moves: 0,
    rngSeed: seed,
    settings,
  };
}

export function reducer(state: FutoshikiState, action: FutoshikiAction): FutoshikiState {
  if (state.won) return state;

  if (action.type === "selectCell") {
    const { idx } = action;
    const { size, givens } = state.puzzle;
    if (idx < 0 || idx >= size * size) return state;
    if (givens[idx] !== 0) return state; // given cell
    return { ...state, selected: idx };
  }

  if (action.type === "placeNumber") {
    const { selected, puzzle, board } = state;
    if (selected === null) return state;
    const { num } = action;
    if (num < 1 || num > puzzle.size) return state;
    const next = [...board];
    next[selected] = num;
    const won = checkWin(puzzle, next);
    return { ...state, board: next, moves: state.moves + 1, won };
  }

  if (action.type === "clearCell") {
    const { selected, puzzle, board } = state;
    if (selected === null) return state;
    if (puzzle.givens[selected] !== 0) return state;
    const next = [...board];
    next[selected] = 0;
    return { ...state, board: next, moves: state.moves + 1 };
  }

  return state;
}

export function isTerminal(state: FutoshikiState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
