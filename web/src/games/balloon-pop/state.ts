import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BalloonPopSettings {
  colors: "3" | "4" | "5";
}

export const COLS = 8;
export const ROWS = 8;

export type Cell = number | null; // color index (0..numColors-1) or null
export type Grid = Cell[][];

export interface BalloonPopState {
  settings: BalloonPopSettings;
  grid: Grid;
  score: number;
  over: boolean;
  numColors: number;
}

export type BalloonPopAction = { type: "pop"; row: number; col: number };

const COLOR_BONUSES = [1, 1.5, 2, 2.5, 3]; // by color index

function makeGrid(seed: number, numColors: number): Grid {
  const rng = mulberry32(seed);
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.floor(rng() * numColors))
  );
}

export function findGroup(grid: Grid, startR: number, startC: number): [number, number][] {
  const color = grid[startR]?.[startC];
  if (color === null || color === undefined) return [];
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

function shiftColumns(grid: Grid): Grid {
  const columns: Cell[][] = [];
  for (let c = 0; c < COLS; c++) {
    const col: Cell[] = Array.from({ length: ROWS }, (_, r) => grid[r]![c] ?? null);
    if (col.some((cell) => cell !== null)) columns.push(col);
  }
  while (columns.length < COLS) columns.push(Array(ROWS).fill(null));
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => columns[c]![r] ?? null)
  );
}

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

function popScore(n: number, color: number): number {
  const bonus = COLOR_BONUSES[color] ?? 1;
  return Math.round(n * (n - 1) * bonus);
}

export function initialState(seed: number, settings: BalloonPopSettings): BalloonPopState {
  const numColors = parseInt(settings.colors, 10);
  const grid = makeGrid(seed, numColors);
  return { settings, grid, score: 0, over: false, numColors };
}

export function reducer(state: BalloonPopState, action: BalloonPopAction): BalloonPopState {
  if (state.over) return state;
  if (action.type !== "pop") return state;

  const { row, col } = action;
  if (state.grid[row]?.[col] === null || state.grid[row]?.[col] === undefined) return state;

  const group = findGroup(state.grid, row, col);
  if (group.length < 2) return state;

  const color = state.grid[row]![col]!;
  let grid = state.grid.map((r) => [...r]);
  for (const [gr, gc] of group) grid[gr]![gc] = null;

  grid = applyGravity(grid);
  grid = shiftColumns(grid);

  const cleared = grid.every((r) => r.every((c) => c === null));
  const points = popScore(group.length, color) + (cleared ? 500 : 0);
  const over = cleared || !hasValidMoves(grid);

  return { ...state, grid, score: state.score + points, over };
}

export function isTerminal(state: BalloonPopState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { popScore };
