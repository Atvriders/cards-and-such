import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM } from "./puzzles.js";
import type { RangePuzzle } from "./puzzles.js";

export type { RangePuzzle };

export interface RangeSettings {
  difficulty: "easy" | "medium";
}

export interface RangeState {
  settings: RangeSettings;
  puzzle: RangePuzzle;
  /** true = player shaded this cell */
  shaded: boolean[];
  won: boolean;
  moves: number;
}

export type RangeAction =
  | { type: "toggleShade"; idx: number }
  | { type: "reset" };

/** Count white cells visible from (r,c) in 4 directions, including itself */
export function computeRange(puzzle: RangePuzzle, shaded: boolean[], r: number, c: number): number {
  const { rows, cols } = puzzle;
  let count = 1; // include self
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]] as const;
  for (const [dr, dc] of dirs) {
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !shaded[nr * cols + nc]) {
      count++;
      nr += dr;
      nc += dc;
    }
  }
  return count;
}

/** Check adjacency of black cells (no two black cells can touch orthogonally) */
export function hasAdjacentBlacks(puzzle: RangePuzzle, shaded: boolean[]): boolean {
  const { rows, cols } = puzzle;
  const dirs = [[0,1],[1,0]] as const;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!shaded[r * cols + c]) continue;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < rows && nc < cols && shaded[nr * cols + nc]) return true;
      }
    }
  }
  return false;
}

export function checkWon(puzzle: RangePuzzle, shaded: boolean[]): boolean {
  const { rows, cols, grid, solution } = puzzle;
  // Must exactly match solution
  for (let i = 0; i < rows * cols; i++) {
    if (shaded[i] !== solution[i]) return false;
  }
  // Numbered cells cannot be shaded
  for (let i = 0; i < rows * cols; i++) {
    if (grid[i] !== null && shaded[i]) return false;
  }
  // No adjacent blacks
  if (hasAdjacentBlacks(puzzle, shaded)) return false;
  // Each numbered cell sees correct range
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = grid[r * cols + c];
      if (v !== null) {
        if (computeRange(puzzle, shaded, r, c) !== v) return false;
      }
    }
  }
  return true;
}

export function initialState(seed: number, settings: RangeSettings): RangeState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_MEDIUM;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    shaded: new Array(puzzle.rows * puzzle.cols).fill(false),
    won: false,
    moves: 0,
  };
}

export function reducer(state: RangeState, action: RangeAction): RangeState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggleShade": {
      const { idx } = action;
      if (state.puzzle.grid[idx] !== null) return state; // numbered cell
      const newShaded = state.shaded.slice();
      newShaded[idx] = !newShaded[idx];
      const won = checkWon(state.puzzle, newShaded);
      return { ...state, shaded: newShaded, won, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, shaded: new Array(state.puzzle.rows * state.puzzle.cols).fill(false), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: RangeState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
