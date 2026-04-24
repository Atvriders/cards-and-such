// ─── Triangle Match state ─────────────────────────────────────────────────────
// Triangular grid (8 rows, each row has 2n-1 triangles). Click groups of 3+ same-color.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const NUM_ROWS = 8;
export const NUM_COLORS = 5;

// Row i has (2*i+1) triangles, alternating up/down
// Triangle j in row i: index = sum of previous rows + j
// Triangle pointing up if (i+j) is even, down if odd

export type TriangleGrid = number[][]; // [row][col] = color

function rowSize(r: number): number { return 2 * r + 1; }

export function totalCells(): number {
  let n = 0;
  for (let r = 0; r < NUM_ROWS; r++) n += rowSize(r);
  return n;
}

// Neighbors of triangle (row, col):
// Each triangle has 2 edge neighbors in same row (left/right) and 1 in adjacent row (vertex)
export function neighbors(row: number, col: number): [number, number][] {
  const result: [number, number][] = [];
  const size = rowSize(row);

  // Left/right in same row
  if (col > 0) result.push([row, col - 1]);
  if (col < size - 1) result.push([row, col + 1]);

  // Up-pointing triangle (even: row+col even) has a neighbor in next row at col+1
  // Down-pointing (odd: row+col odd) has neighbor in prev row at col-1
  const isUp = (row + col) % 2 === 0;
  if (isUp && row + 1 < NUM_ROWS) {
    // neighbor below at same col position in next row
    result.push([row + 1, col + 1]);
  }
  if (!isUp && row > 0) {
    // neighbor above
    result.push([row - 1, col - 1]);
  }

  return result;
}

export function findGroup(grid: TriangleGrid, startRow: number, startCol: number): [number, number][] {
  const color = grid[startRow]?.[startCol];
  if (color === undefined) return [];
  const visited = new Set<string>();
  const queue: [number, number][] = [[startRow, startCol]];
  const key = (r: number, c: number) => `${r},${c}`;
  visited.add(key(startRow, startCol));
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const [nr, nc] of neighbors(r, c)) {
      const k = key(nr, nc);
      if (visited.has(k)) continue;
      if (grid[nr]?.[nc] === color) {
        visited.add(k);
        queue.push([nr, nc]);
      }
    }
  }
  return Array.from(visited).map((k) => k.split(",").map(Number) as [number, number]);
}

export interface TriangleMatchSettings {
  colors: "4" | "5" | "6";
}

export interface TriangleMatchState {
  settings: TriangleMatchSettings;
  grid: TriangleGrid;
  score: number;
  over: boolean;
  numColors: number;
}

export type TriangleMatchAction =
  | { type: "click"; row: number; col: number };

function makeGrid(seed: number, numColors: number): TriangleGrid {
  const rng = mulberry32(seed);
  return Array.from({ length: NUM_ROWS }, (_, r) =>
    Array.from({ length: rowSize(r) }, () => Math.floor(rng() * numColors))
  );
}

function hasValidMoves(grid: TriangleGrid): boolean {
  for (let r = 0; r < NUM_ROWS; r++) {
    for (let c = 0; c < rowSize(r); c++) {
      if (grid[r]?.[c] === undefined) continue;
      const group = findGroup(grid, r, c);
      if (group.length >= 3) return true;
    }
  }
  return false;
}

export function initialState(seed: number, settings: TriangleMatchSettings): TriangleMatchState {
  const numColors = parseInt(settings.colors, 10);
  return {
    settings,
    grid: makeGrid(seed, numColors),
    score: 0,
    over: false,
    numColors,
  };
}

export function reducer(state: TriangleMatchState, action: TriangleMatchAction): TriangleMatchState {
  if (state.over) return state;

  switch (action.type) {
    case "click": {
      const { row, col } = action;
      const group = findGroup(state.grid, row, col);
      if (group.length < 3) return state;

      const grid = state.grid.map((row) => [...row]);
      for (const [r, c] of group) {
        if (grid[r]) grid[r]![c] = -1; // mark removed
      }

      const points = group.length * (group.length - 2) * 10;
      const over = !hasValidMoves(grid);

      return { ...state, grid, score: state.score + points, over };
    }
    default:
      return state;
  }
}

export function isTerminal(state: TriangleMatchState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
