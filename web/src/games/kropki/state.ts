import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { KropkiPuzzle, KropkiDot } from "./puzzles.js";
export type { KropkiPuzzle, KropkiDot };

export interface KropkiSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface KropkiState {
  settings: KropkiSettings;
  puzzle: KropkiPuzzle;
  /** player grid: 0 = empty, 1-size = filled */
  grid: number[];
  won: boolean;
  moves: number;
}

export type KropkiAction =
  | { type: "setCell"; idx: number; value: number }
  | { type: "reset" };

export function checkDotConstraints(puzzle: KropkiPuzzle, grid: number[]): boolean {
  for (const dot of puzzle.dots) {
    const a = grid[dot.r1 * puzzle.size + dot.c1]!;
    const b = grid[dot.r2 * puzzle.size + dot.c2]!;
    if (a === 0 || b === 0) return false;
    if (dot.kind === "white") {
      if (Math.abs(a - b) !== 1) return false;
    } else {
      if (a !== 2 * b && b !== 2 * a) return false;
    }
  }
  return true;
}

export function checkLatinSquare(size: number, grid: number[]): boolean {
  for (let r = 0; r < size; r++) {
    const rowSeen = new Set<number>();
    for (let c = 0; c < size; c++) {
      const v = grid[r * size + c]!;
      if (v === 0 || rowSeen.has(v)) return false;
      rowSeen.add(v);
    }
  }
  for (let c = 0; c < size; c++) {
    const colSeen = new Set<number>();
    for (let r = 0; r < size; r++) {
      const v = grid[r * size + c]!;
      if (v === 0 || colSeen.has(v)) return false;
      colSeen.add(v);
    }
  }
  return true;
}

export function checkWon(puzzle: KropkiPuzzle, grid: number[]): boolean {
  if (!checkLatinSquare(puzzle.size, grid)) return false;
  if (!checkDotConstraints(puzzle, grid)) return false;
  return true;
}

export function initialState(seed: number, settings: KropkiSettings): KropkiState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  const { size, solution } = puzzle;
  const grid = new Array<number>(size * size).fill(0);
  // Fill givens
  for (const [r, c] of puzzle.givens) {
    grid[r * size + c] = solution[r * size + c]!;
  }
  return { settings, puzzle, grid, won: false, moves: 0 };
}

export function reducer(state: KropkiState, action: KropkiAction): KropkiState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "setCell": {
      const { idx, value } = action;
      // Don't allow overwriting givens
      if (state.puzzle.givens.length > 0) {
        const r = Math.floor(idx / state.puzzle.size);
        const c = idx % state.puzzle.size;
        if (state.puzzle.givens.some(([gr, gc]) => gr === r && gc === c)) return state;
      }
      const newGrid = state.grid.slice();
      newGrid[idx] = value;
      const won = checkWon(state.puzzle, newGrid);
      return { ...state, grid: newGrid, won, moves: state.moves + 1 };
    }
    case "reset": {
      const { size, solution } = state.puzzle;
      const grid = new Array<number>(size * size).fill(0);
      for (const [r, c] of state.puzzle.givens) {
        grid[r * size + c] = solution[r * size + c]!;
      }
      return { ...state, grid, won: false, moves: 0 };
    }
    default:
      return state;
  }
}

export function isTerminal(state: KropkiState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
