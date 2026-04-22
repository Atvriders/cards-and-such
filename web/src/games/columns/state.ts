// ─── Columns (falling-block, Sega Columns-like) state ─────────────────────────
// 6×14 grid. Trios of 3 colored gems fall. Match 3+ horiz/vert/diag = clear.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 6;
export const ROWS = 14;
export const NUM_COLORS = 6;

export type Cell = number | null; // 0..NUM_COLORS-1
export type Grid = Cell[][];

export interface ColumnsSettings {
  startLevel: "1" | "3" | "5";
}

export interface Trio {
  col: number;
  row: number; // row of top gem
  gems: [number, number, number]; // top, mid, bottom colors
}

export interface ColumnsState {
  settings: ColumnsSettings;
  grid: Grid;
  current: Trio;
  next: [number, number, number];
  score: number;
  level: number;
  linesCleared: number;
  over: boolean;
  rngSeed: number;
}

export type ColumnsAction =
  | { type: "tick" }
  | { type: "left" }
  | { type: "right" }
  | { type: "rotate" }
  | { type: "drop" };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function nextSeedVal(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

function randomGem(rng: () => number): number {
  return Math.floor(rng() * NUM_COLORS);
}

function randomTrio(seed: number): { gems: [number, number, number]; nextSeed: number } {
  const rng = mulberry32(seed);
  const gems: [number, number, number] = [randomGem(rng), randomGem(rng), randomGem(rng)];
  return { gems, nextSeed: nextSeedVal(seed) };
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function isOccupied(grid: Grid, row: number, col: number): boolean {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
  return grid[row]![col] !== null;
}

// Find all cells that are part of matches (horiz/vert/diag 3+)
function findMatchCells(grid: Grid): Set<string> {
  const matched = new Set<string>();

  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = grid[r]![c];
      if (color === null) continue;
      for (const [dr, dc] of directions) {
        let len = 1;
        while (
          r + dr * len >= 0 && r + dr * len < ROWS &&
          c + dc * len >= 0 && c + dc * len < COLS &&
          grid[r + dr * len]![c + dc * len] === color
        ) len++;
        if (len >= 3) {
          for (let k = 0; k < len; k++) {
            matched.add(`${r + dr * k},${c + dc * k}`);
          }
        }
      }
    }
  }
  return matched;
}

function applyGravity(grid: Grid): Grid {
  const next = grid.map((row) => [...row]);
  for (let c = 0; c < COLS; c++) {
    const gems: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r]![c] !== null) gems.push(next[r]![c]!);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      next[r]![c] = gems.length > 0 ? (gems.shift() ?? null) : null;
    }
  }
  return next;
}

function lockTrio(grid: Grid, trio: Trio): Grid {
  const next = grid.map((r) => [...r]);
  next[trio.row]![trio.col] = trio.gems[0];
  next[trio.row + 1]![trio.col] = trio.gems[1];
  next[trio.row + 2]![trio.col] = trio.gems[2];
  return next;
}

function canPlace(grid: Grid, trio: Trio): boolean {
  for (let i = 0; i < 3; i++) {
    if (isOccupied(grid, trio.row + i, trio.col)) return false;
  }
  return true;
}

function spawnTrio(gems: [number, number, number]): Trio {
  return { col: Math.floor(COLS / 2), row: 0, gems };
}

export function tickDelay(level: number): number {
  return Math.max(100, 800 - level * 70);
}

// ─── Initial state ─────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: ColumnsSettings): ColumnsState {
  const level = parseInt(settings.startLevel, 10);
  const { gems: currentGems, nextSeed: s1 } = randomTrio(seed);
  const { gems: nextGems, nextSeed: s2 } = randomTrio(s1);
  return {
    settings,
    grid: emptyGrid(),
    current: spawnTrio(currentGems),
    next: nextGems,
    score: 0,
    level,
    linesCleared: 0,
    over: false,
    rngSeed: s2,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function lockAndSpawn(state: ColumnsState): ColumnsState {
  let grid = lockTrio(state.grid, state.current);
  let totalScore = 0;
  let totalCleared = 0;
  let cascade = 1;
  while (true) {
    const matched = findMatchCells(grid);
    if (matched.size === 0) break;
    totalCleared += matched.size;
    totalScore += matched.size * 10 * cascade;
    cascade++;
    const newGrid = grid.map((r) => [...r]);
    for (const key of matched) {
      const [r, c] = key.split(",").map(Number) as [number, number];
      newGrid[r]![c] = null;
    }
    grid = applyGravity(newGrid);
  }

  const newLinesCleared = state.linesCleared + Math.floor(totalCleared / 3);
  const newLevel = Math.max(state.level, parseInt(state.settings.startLevel, 10) + Math.floor(newLinesCleared / 10));

  const { gems: nextGems, nextSeed } = randomTrio(state.rngSeed);
  const newCurrent = spawnTrio(state.next);

  if (!canPlace(grid, newCurrent)) {
    return {
      ...state,
      grid,
      score: state.score + totalScore,
      level: newLevel,
      linesCleared: newLinesCleared,
      over: true,
    };
  }

  return {
    ...state,
    grid,
    current: newCurrent,
    next: nextGems,
    score: state.score + totalScore,
    level: newLevel,
    linesCleared: newLinesCleared,
    rngSeed: nextSeed,
  };
}

export function reducer(state: ColumnsState, action: ColumnsAction): ColumnsState {
  if (state.over) return state;

  switch (action.type) {
    case "left": {
      if (state.current.col <= 0) return state;
      const moved = { ...state.current, col: state.current.col - 1 };
      for (let i = 0; i < 3; i++) {
        if (isOccupied(state.grid, moved.row + i, moved.col)) return state;
      }
      return { ...state, current: moved };
    }

    case "right": {
      if (state.current.col >= COLS - 1) return state;
      const moved = { ...state.current, col: state.current.col + 1 };
      for (let i = 0; i < 3; i++) {
        if (isOccupied(state.grid, moved.row + i, moved.col)) return state;
      }
      return { ...state, current: moved };
    }

    case "rotate": {
      // Cycle gems: [top, mid, bot] → [bot, top, mid]
      const [a, b, c] = state.current.gems;
      const rotated: [number, number, number] = [c!, a!, b!];
      return { ...state, current: { ...state.current, gems: rotated } };
    }

    case "drop": {
      // Hard drop: move all the way down
      let trio = { ...state.current };
      while (canPlace(state.grid, { ...trio, row: trio.row + 1 })) {
        trio = { ...trio, row: trio.row + 1 };
      }
      return lockAndSpawn({ ...state, current: trio });
    }

    case "tick": {
      const moved = { ...state.current, row: state.current.row + 1 };
      if (!canPlace(state.grid, moved)) {
        return lockAndSpawn(state);
      }
      return { ...state, current: moved };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ColumnsState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { findMatchCells, applyGravity };
