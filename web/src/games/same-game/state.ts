// ─── Same Game (Clickomania) state ────────────────────────────────────────────
// 15×10 grid. Click connected same-color groups (2+) to remove. Gravity + column shift.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 15;
export const ROWS = 10;

export type Cell = number | null; // 0..numColors-1
export type Grid = Cell[][];

export interface SameGameSettings {
  colors: "3" | "4" | "5";
}

export interface SameGameState {
  settings: SameGameSettings;
  grid: Grid;
  score: number;
  over: boolean;
  numColors: number;
}

export type SameGameAction =
  | { type: "click"; row: number; col: number };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function makeGrid(seed: number, numColors: number): Grid {
  const rng = mulberry32(seed);
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.floor(rng() * numColors))
  );
}

// ─── BFS flood fill ───────────────────────────────────────────────────────────
export function findGroup(grid: Grid, startR: number, startC: number): [number, number][] {
  const color = grid[startR]![startC];
  if (color === null) return [];
  const visited = new Set<string>();
  const queue: [number, number][] = [[startR, startC]];
  visited.add(`${startR},${startC}`);
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      if (grid[nr]![nc] === color) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return Array.from(visited).map((k) => k.split(",").map(Number) as [number, number]);
}

// Group of N blocks scores N*(N-1)
function groupScore(n: number): number {
  return n * (n - 1);
}

// Apply gravity: blocks fall down within each column
function applyGravity(grid: Grid): Grid {
  const next = grid.map((r) => [...r]);
  for (let c = 0; c < COLS; c++) {
    const cells: Cell[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r]![c] !== null) cells.push(next[r]![c]!);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      next[r]![c] = cells.length > 0 ? (cells.shift() ?? null) : null;
    }
  }
  return next;
}

// Shift empty columns to the right: non-empty columns slide left
function shiftColumns(grid: Grid): Grid {
  const columns: Cell[][] = [];
  for (let c = 0; c < COLS; c++) {
    const col: Cell[] = Array.from({ length: ROWS }, (_, r) => grid[r]![c] ?? null);
    if (col.some((cell) => cell !== null)) columns.push(col);
  }
  while (columns.length < COLS) columns.push(Array(ROWS).fill(null));
  // Reconstruct grid
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => columns[c]![r] ?? null)
  );
}

// Check if any valid moves remain (any group of 2+)
export function hasValidMoves(grid: Grid): boolean {
  const visited = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r]![c] === null) continue;
      const key = `${r},${c}`;
      if (visited.has(key)) continue;
      const group = findGroup(grid, r, c);
      for (const [gr, gc] of group) visited.add(`${gr},${gc}`);
      if (group.length >= 2) return true;
    }
  }
  return false;
}

function isBoardClear(grid: Grid): boolean {
  return grid.every((row) => row.every((cell) => cell === null));
}

// ─── Initial state ─────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: SameGameSettings): SameGameState {
  const numColors = parseInt(settings.colors, 10);
  const grid = makeGrid(seed, numColors);
  return {
    settings,
    grid,
    score: 0,
    over: false,
    numColors,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: SameGameState, action: SameGameAction): SameGameState {
  if (state.over) return state;

  switch (action.type) {
    case "click": {
      const { row, col } = action;
      if (state.grid[row]![col] === null) return state;
      const group = findGroup(state.grid, row, col);
      if (group.length < 2) return state; // single cell, can't remove

      // Remove group
      let grid = state.grid.map((r) => [...r]);
      for (const [gr, gc] of group) grid[gr]![gc] = null;

      // Apply gravity then shift columns
      grid = applyGravity(grid);
      grid = shiftColumns(grid);

      const cleared = isBoardClear(grid);
      const points = groupScore(group.length) + (cleared ? 1000 : 0);

      const over = cleared || !hasValidMoves(grid);

      return {
        ...state,
        grid,
        score: state.score + points,
        over,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SameGameState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { applyGravity, shiftColumns, groupScore };
