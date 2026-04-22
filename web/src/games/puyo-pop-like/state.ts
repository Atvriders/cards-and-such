// ─── Puyo Pop-like state ─────────────────────────────────────────────────────
// 6×12 grid. Pairs of colored blobs fall. 4+ connected same-color = pop.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 6;
export const ROWS = 12;
export const NUM_COLORS = 5;

export type Cell = number | null; // 0..NUM_COLORS-1
export type Grid = Cell[][];

export interface PuyoSettings {
  startLevel: "1" | "3" | "5";
}

export interface Pair {
  // Pivot (axis) position
  pivotRow: number;
  pivotCol: number;
  // Satellite offset relative to pivot: 0=up, 1=right, 2=down, 3=left
  satelliteDir: 0 | 1 | 2 | 3;
  pivotColor: number;
  satelliteColor: number;
}

export interface PuyoState {
  settings: PuyoSettings;
  grid: Grid;
  current: Pair;
  next: { pivotColor: number; satelliteColor: number };
  score: number;
  level: number;
  pairsDropped: number;
  over: boolean;
  rngSeed: number;
}

export type PuyoAction =
  | { type: "tick" }
  | { type: "left" }
  | { type: "right" }
  | { type: "rotate-cw" }
  | { type: "rotate-ccw" }
  | { type: "drop" };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function advSeed(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

function randomColor(seed: number): { color: number; nextSeed: number } {
  const next = advSeed(seed);
  return { color: next % NUM_COLORS, nextSeed: next };
}

function randomPair(seed: number): { pivotColor: number; satelliteColor: number; nextSeed: number } {
  const { color: c1, nextSeed: s1 } = randomColor(seed);
  const { color: c2, nextSeed: s2 } = randomColor(s1);
  return { pivotColor: c1, satelliteColor: c2, nextSeed: s2 };
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
export function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

const DIR_OFFSETS: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // up, right, down, left

export function pairCells(pair: Pair): [[number, number], [number, number]] {
  const [dr, dc] = DIR_OFFSETS[pair.satelliteDir]!;
  return [
    [pair.pivotRow, pair.pivotCol],
    [pair.pivotRow + dr, pair.pivotCol + dc],
  ];
}

function isOccupied(grid: Grid, r: number, c: number): boolean {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
  return grid[r]![c] !== null;
}

function canPlace(grid: Grid, pair: Pair): boolean {
  return pairCells(pair).every(([r, c]) => !isOccupied(grid, r, c));
}

function spawnPair(pivotColor: number, satelliteColor: number): Pair {
  return {
    pivotRow: 1,
    pivotCol: Math.floor(COLS / 2),
    satelliteDir: 0, // satellite is above pivot initially
    pivotColor,
    satelliteColor,
  };
}

// BFS flood fill to find connected same-color cells
function floodFill(grid: Grid, startR: number, startC: number): [number, number][] {
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

function findPops(grid: Grid): Set<string> {
  const popped = new Set<string>();
  const visited = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = `${r},${c}`;
      if (visited.has(key) || grid[r]![c] === null) continue;
      const group = floodFill(grid, r, c);
      for (const [gr, gc] of group) visited.add(`${gr},${gc}`);
      if (group.length >= 4) {
        for (const [gr, gc] of group) popped.add(`${gr},${gc}`);
      }
    }
  }
  return popped;
}

function applyGravity(grid: Grid): Grid {
  const next = grid.map((r) => [...r]);
  for (let c = 0; c < COLS; c++) {
    const gems: Cell[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r]![c] !== null) gems.push(next[r]![c]!);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      next[r]![c] = gems.length > 0 ? (gems.shift() ?? null) : null;
    }
  }
  return next;
}

export function tickDelay(level: number): number {
  return Math.max(100, 700 - level * 60);
}

// ─── Initial state ─────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: PuyoSettings): PuyoState {
  const level = parseInt(settings.startLevel, 10);
  const { pivotColor: pc, satelliteColor: sc, nextSeed: s1 } = randomPair(seed);
  const { pivotColor: np, satelliteColor: ns, nextSeed: s2 } = randomPair(s1);
  return {
    settings,
    grid: emptyGrid(),
    current: spawnPair(pc, sc),
    next: { pivotColor: np, satelliteColor: ns },
    score: 0,
    level,
    pairsDropped: 0,
    over: false,
    rngSeed: s2,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function lockAndSpawn(state: PuyoState): PuyoState {
  const [[pr, pc_col], [sr, sc_col]] = pairCells(state.current);
  let grid = state.grid.map((r) => [...r]);
  if (pr >= 0 && pr < ROWS && pc_col >= 0 && pc_col < COLS) grid[pr]![pc_col] = state.current.pivotColor;
  if (sr >= 0 && sr < ROWS && sc_col >= 0 && sc_col < COLS) grid[sr]![sc_col] = state.current.satelliteColor;

  grid = applyGravity(grid);

  let totalScore = 0;
  let cascade = 1;
  while (true) {
    const pops = findPops(grid);
    if (pops.size === 0) break;
    totalScore += pops.size * 10 * cascade;
    cascade++;
    const newGrid = grid.map((r) => [...r]);
    for (const key of pops) {
      const [r, c] = key.split(",").map(Number) as [number, number];
      newGrid[r]![c] = null;
    }
    grid = applyGravity(newGrid);
  }

  const pairsDropped = state.pairsDropped + 1;
  const newLevel = Math.max(state.level, parseInt(state.settings.startLevel, 10) + Math.floor(pairsDropped / 10));

  const { pivotColor: np, satelliteColor: ns, nextSeed } = randomPair(state.rngSeed);
  const newCurrent = spawnPair(state.next.pivotColor, state.next.satelliteColor);

  if (!canPlace(grid, newCurrent)) {
    return { ...state, grid, score: state.score + totalScore, level: newLevel, pairsDropped, over: true };
  }

  return {
    ...state,
    grid,
    current: newCurrent,
    next: { pivotColor: np, satelliteColor: ns },
    score: state.score + totalScore,
    level: newLevel,
    pairsDropped,
    rngSeed: nextSeed,
  };
}

export function reducer(state: PuyoState, action: PuyoAction): PuyoState {
  if (state.over) return state;
  const pair = state.current;

  switch (action.type) {
    case "left": {
      const moved = { ...pair, pivotCol: pair.pivotCol - 1 };
      if (!canPlace(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "right": {
      const moved = { ...pair, pivotCol: pair.pivotCol + 1 };
      if (!canPlace(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "rotate-cw": {
      const newDir = ((pair.satelliteDir + 1) % 4) as 0 | 1 | 2 | 3;
      const moved = { ...pair, satelliteDir: newDir };
      if (!canPlace(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "rotate-ccw": {
      const newDir = ((pair.satelliteDir + 3) % 4) as 0 | 1 | 2 | 3;
      const moved = { ...pair, satelliteDir: newDir };
      if (!canPlace(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "drop": {
      let cur = pair;
      while (canPlace(state.grid, { ...cur, pivotRow: cur.pivotRow + 1 })) {
        cur = { ...cur, pivotRow: cur.pivotRow + 1 };
      }
      return lockAndSpawn({ ...state, current: cur });
    }

    case "tick": {
      const moved = { ...pair, pivotRow: pair.pivotRow + 1 };
      if (!canPlace(state.grid, moved)) return lockAndSpawn(state);
      return { ...state, current: moved };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PuyoState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { findPops, applyGravity, floodFill };
