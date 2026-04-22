import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HidatoPuzzle {
  rows: number;
  cols: number;
  /** solution[r*cols+c] = number 1..N, or 0 if cell is blocked/outside */
  solution: number[];
  /** given[r*cols+c] = true if cell is pre-filled (shown to player) */
  given: boolean[];
}

export interface HidatoSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface HidatoState {
  puzzle: HidatoPuzzle;
  /** player's fill: 0 = empty, >0 = number placed */
  board: number[];
  selected: number | null; // cell index being selected
  won: boolean;
  moves: number;
  rngSeed: number;
  settings: HidatoSettings;
}

export type HidatoAction =
  | { type: "selectCell"; idx: number }
  | { type: "placeNumber"; num: number }
  | { type: "clearCell"; idx: number };

// ---------- Pre-designed puzzles ----------

// Easy 5×5 (N=25)
const EASY_PUZZLES: HidatoPuzzle[] = [
  {
    rows: 5, cols: 5,
    solution: [
       1,  2,  3,  4,  5,
      16, 17, 18,  5,  6,
      15, 24, 19,  6,  7,
      14, 23, 20,  8,  0,
      13, 22, 21,  9, 10,
    ],
    given: [
      true,  false, false, false, true,
      false, false, false, false, false,
      false, false, false, false, false,
      false, false, false, false, false,
      true,  false, false, false, true,
    ],
  },
  {
    rows: 5, cols: 5,
    solution: [
       1,  2,  3,  4,  5,
      10,  9,  8,  7,  6,
      11, 12, 13, 14, 15,
      20, 19, 18, 17, 16,
      21, 22, 23, 24, 25,
    ],
    given: [
      true,  false, false, false, false,
      false, false, false, false, true,
      false, false, true,  false, false,
      false, false, false, false, false,
      false, false, false, false, true,
    ],
  },
  {
    rows: 5, cols: 5,
    solution: [
       5,  4,  3,  2,  1,
       6,  7,  8,  9, 10,
      15, 14, 13, 12, 11,
      16, 17, 18, 19, 20,
      25, 24, 23, 22, 21,
    ],
    given: [
      true,  false, false, false, true,
      false, false, false, false, false,
      false, false, true,  false, false,
      false, false, false, false, false,
      true,  false, false, false, true,
    ],
  },
  {
    rows: 5, cols: 5,
    solution: [
       1,  2,  3,  4,  5,
      12, 13, 14,  5,  6,
      11, 20, 15,  6,  7,
      10, 19, 16,  8,  0,
       9, 18, 17,  0,  0,
    ],
    given: [
      true,  false, false, false, false,
      false, false, false, false, false,
      false, false, false, false, false,
      false, false, false, false, false,
      true,  false, true,  false, false,
    ],
  },
];

// Medium 6×6 (N=36 max, some cells blocked)
const MEDIUM_PUZZLES: HidatoPuzzle[] = [
  {
    rows: 6, cols: 6,
    solution: [
       1,  2,  3,  4,  5,  6,
      12, 11, 10,  9,  8,  7,
      13, 14, 15, 16, 17, 18,
      24, 23, 22, 21, 20, 19,
      25, 26, 27, 28, 29, 30,
      36, 35, 34, 33, 32, 31,
    ],
    given: [
      true,  false, false, false, false, false,
      false, false, false, false, false, true,
      false, false, true,  false, false, false,
      false, false, false, false, false, true,
      false, false, false, false, false, false,
      true,  false, false, false, false, true,
    ],
  },
  {
    rows: 6, cols: 6,
    solution: [
       1,  2,  3,  4,  5,  6,
      20, 21, 22, 23, 24,  7,
      19, 32, 33, 34, 25,  8,
      18, 31, 36, 35, 26,  9,
      17, 30, 29, 28, 27, 10,
      16, 15, 14, 13, 12, 11,
    ],
    given: [
      true,  false, false, false, false, true,
      false, false, false, false, false, false,
      false, false, false, false, false, false,
      false, false, true,  false, false, false,
      false, false, false, false, false, false,
      true,  false, false, false, false, true,
    ],
  },
  {
    rows: 6, cols: 6,
    solution: [
       6,  5,  4,  3,  2,  1,
       7,  8,  9, 10, 11, 12,
      18, 17, 16, 15, 14, 13,
      19, 20, 21, 22, 23, 24,
      30, 29, 28, 27, 26, 25,
      31, 32, 33, 34, 35, 36,
    ],
    given: [
      false, false, false, false, false, true,
      true,  false, false, false, false, false,
      false, false, false, false, false, true,
      true,  false, false, false, false, false,
      false, false, false, false, false, true,
      true,  false, false, false, true,  false,
    ],
  },
];

// Hard 7×7 (N=49)
const HARD_PUZZLES: HidatoPuzzle[] = [
  {
    rows: 7, cols: 7,
    solution: [
       1,  2,  3,  4,  5,  6,  7,
      14, 13, 12, 11, 10,  9,  8,
      15, 16, 17, 18, 19, 20, 21,
      28, 27, 26, 25, 24, 23, 22,
      29, 30, 31, 32, 33, 34, 35,
      42, 41, 40, 39, 38, 37, 36,
      43, 44, 45, 46, 47, 48, 49,
    ],
    given: [
      true,  false, false, false, false, false, true,
      false, false, false, false, false, false, false,
      false, false, true,  false, false, false, false,
      false, false, false, false, false, false, false,
      false, false, false, false, true,  false, false,
      false, false, false, false, false, false, false,
      true,  false, false, false, false, false, true,
    ],
  },
  {
    rows: 7, cols: 7,
    solution: [
       1,  2,  3,  4,  5,  6,  7,
      28, 27, 26, 25, 24,  8,  0,
      29, 42, 43, 44, 23,  9,  0,
      30, 41, 48, 45, 22, 10,  0,
      31, 40, 47, 46, 21, 11,  0,
      32, 39, 38, 37, 20, 12,  0,
      33, 34, 35, 36, 19, 13, 14,
    ],
    given: [
      true,  false, false, false, false, true,  false,
      false, false, false, false, false, false, false,
      false, false, false, false, false, false, false,
      false, false, true,  false, false, false, false,
      false, false, false, false, false, false, false,
      false, false, false, false, false, false, false,
      true,  false, false, false, false, false, true,
    ],
  },
];

function allPuzzles(difficulty: string): HidatoPuzzle[] {
  if (difficulty === "hard") return HARD_PUZZLES;
  if (difficulty === "medium") return MEDIUM_PUZZLES;
  return EASY_PUZZLES;
}

// Check if a is king-adjacent (including diagonal) to b in the grid
function adjacent(a: number, b: number, cols: number): boolean {
  const ar = Math.floor(a / cols);
  const ac = a % cols;
  const br = Math.floor(b / cols);
  const bc = b % cols;
  return Math.abs(ar - br) <= 1 && Math.abs(ac - bc) <= 1 && a !== b;
}

export function checkWin(puzzle: HidatoPuzzle, board: number[]): boolean {
  const { rows, cols, solution } = puzzle;
  const N = solution.filter((v) => v > 0).length; // number of actual cells
  // Check all cells with a non-zero solution value are filled correctly
  for (let i = 0; i < rows * cols; i++) {
    if (solution[i] === 0) continue; // blocked cell
    if (board[i] !== solution[i]) return false;
  }
  // Check consecutive numbers are adjacent
  // Build position map: num -> index
  const pos = new Array<number>(N + 1).fill(-1);
  for (let i = 0; i < rows * cols; i++) {
    if ((board[i] ?? 0) > 0) pos[board[i]!] = i;
  }
  for (let n = 1; n < N; n++) {
    if (pos[n] === -1 || pos[n + 1] === -1) return false;
    if (!adjacent(pos[n]!, pos[n + 1]!, cols)) return false;
  }
  return true;
}

export function initialState(seed: number, settings: HidatoSettings): HidatoState {
  const rng = mulberry32(seed);
  const puzzles = allPuzzles(settings.difficulty);
  const idx = Math.floor(rng() * puzzles.length);
  const puzzle = puzzles[idx]!;
  const { rows, cols, solution, given } = puzzle;
  const board = new Array<number>(rows * cols).fill(0);
  for (let i = 0; i < rows * cols; i++) {
    if (given[i]) board[i] = solution[i]!;
  }
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

export function reducer(state: HidatoState, action: HidatoAction): HidatoState {
  if (state.won) return state;

  if (action.type === "selectCell") {
    const { idx } = action;
    if (idx < 0 || idx >= state.board.length) return state;
    if (state.puzzle.solution[idx] === 0) return state; // blocked
    if (state.puzzle.given[idx]) return state; // can't select givens
    return { ...state, selected: idx };
  }

  if (action.type === "placeNumber") {
    const { selected, puzzle, board } = state;
    if (selected === null) return state;
    if (puzzle.given[selected]) return state;
    const { num } = action;
    const N = puzzle.solution.filter((v) => v > 0).length;
    if (num < 1 || num > N) return state;
    const next = [...board];
    // Remove num from any other cell first
    for (let i = 0; i < next.length; i++) {
      if (next[i] === num) next[i] = 0;
    }
    next[selected] = num;
    const won = checkWin(puzzle, next);
    return { ...state, board: next, moves: state.moves + 1, won };
  }

  if (action.type === "clearCell") {
    const { idx } = action;
    if (idx < 0 || idx >= state.board.length) return state;
    if (state.puzzle.given[idx]) return state;
    const next = [...state.board];
    next[idx] = 0;
    return { ...state, board: next, moves: state.moves + 1 };
  }

  return state;
}

export function isTerminal(state: HidatoState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
