// ─── Dr. Mario-like state ─────────────────────────────────────────────────────
// 8×16 grid. Pre-placed virus blobs. Drop 2-cell capsules. Match 4+ = clear.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 8;
export const ROWS = 16;
export const VIRUS_ROWS_START = 8; // viruses placed in bottom half

export type CellKind = "virus" | "capsule" | null;

export interface Cell {
  color: number;
  kind: CellKind;
}

export type Grid = (Cell | null)[][];

export type Orientation = "horizontal" | "vertical";

export interface Capsule {
  row: number;
  col: number;
  orientation: Orientation;
  // Two halves: [0] = top/left, [1] = bottom/right
  colors: [number, number];
}

export interface DrMarioSettings {
  difficulty: "low" | "medium" | "high";
}

export interface DrMarioState {
  settings: DrMarioSettings;
  grid: Grid;
  current: Capsule | null;
  next: [number, number];
  score: number;
  virusCount: number;
  over: boolean;
  won: boolean;
  rngSeed: number;
}

export type DrMarioAction =
  | { type: "tick" }
  | { type: "left" }
  | { type: "right" }
  | { type: "rotate" }
  | { type: "down" }
  | { type: "drop" };

// ─── RNG ──────────────────────────────────────────────────────────────────────
export const NUM_COLORS = 4;

function advSeed(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

function rngColor(seed: number): { color: number; nextSeed: number } {
  const next = advSeed(seed);
  return { color: next % NUM_COLORS, nextSeed: next };
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function placeViruses(grid: Grid, count: number, seed: number): { grid: Grid; nextSeed: number } {
  const next = grid.map((r) => [...r]) as Grid;
  // Build list of all valid positions in the virus zone
  const positions: [number, number][] = [];
  for (let r = VIRUS_ROWS_START; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      positions.push([r, c]);
    }
  }
  // Fisher-Yates shuffle using LCG
  let s = seed;
  for (let i = positions.length - 1; i > 0; i--) {
    s = advSeed(s);
    const j = s % (i + 1);
    const tmp = positions[i]!;
    positions[i] = positions[j]!;
    positions[j] = tmp;
  }
  // Place viruses in first `count` shuffled positions
  const actualCount = Math.min(count, positions.length);
  for (let i = 0; i < actualCount; i++) {
    const [r, c] = positions[i]!;
    s = advSeed(s);
    const color = s % NUM_COLORS;
    next[r]![c] = { color, kind: "virus" };
  }
  return { grid: next, nextSeed: s };
}

function virusCount(grid: Grid): number {
  let n = 0;
  for (const row of grid) for (const cell of row) if (cell?.kind === "virus") n++;
  return n;
}

// Get the two cell positions of a capsule
function capsuleCells(cap: Capsule): [[number, number], [number, number]] {
  if (cap.orientation === "vertical") {
    return [[cap.row, cap.col], [cap.row + 1, cap.col]];
  }
  return [[cap.row, cap.col], [cap.row, cap.col + 1]];
}

function isOccupied(grid: Grid, r: number, c: number): boolean {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
  return grid[r]![c] !== null;
}

function canPlace(grid: Grid, cap: Capsule): boolean {
  const cells = capsuleCells(cap);
  return cells.every(([r, c]) => !isOccupied(grid, r, c));
}

function lockCapsule(grid: Grid, cap: Capsule): Grid {
  const next = grid.map((r) => [...r]) as Grid;
  const [[r1, c1], [r2, c2]] = capsuleCells(cap);
  next[r1]![c1] = { color: cap.colors[0], kind: "capsule" };
  next[r2]![c2] = { color: cap.colors[1], kind: "capsule" };
  return next;
}

// Find all cells that are part of 4+ same-color contiguous groups
function findMatchCells(grid: Grid): Set<string> {
  const matched = new Set<string>();
  const directions: [number, number][] = [[0, 1], [1, 0]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r]![c];
      if (!cell) continue;
      for (const [dr, dc] of directions) {
        let len = 1;
        while (
          r + dr * len < ROWS && c + dc * len < COLS &&
          grid[r + dr * len]![c + dc * len]?.color === cell.color
        ) len++;
        if (len >= 4) {
          for (let k = 0; k < len; k++) matched.add(`${r + dr * k},${c + dc * k}`);
        }
      }
    }
  }
  return matched;
}

function applyGravity(grid: Grid): Grid {
  const next = grid.map((r) => [...r]) as Grid;
  for (let c = 0; c < COLS; c++) {
    const gems: (Cell | null)[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r]![c] !== null) gems.push(next[r]![c] ?? null);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      next[r]![c] = gems.length > 0 ? (gems.shift() ?? null) : null;
    }
  }
  return next;
}

function spawnCapsule(colors: [number, number]): Capsule {
  return { row: 0, col: Math.floor(COLS / 2) - 1, orientation: "horizontal", colors };
}

function randomColors(seed: number): { colors: [number, number]; nextSeed: number } {
  const { color: c1, nextSeed: s1 } = rngColor(seed);
  const { color: c2, nextSeed: s2 } = rngColor(s1);
  return { colors: [c1, c2], nextSeed: s2 };
}

// ─── Initial state ─────────────────────────────────────────────────────────────
const VIRUS_COUNTS: Record<string, number> = { low: 15, medium: 25, high: 40 };

export function initialState(seed: number, settings: DrMarioSettings): DrMarioState {
  const count = VIRUS_COUNTS[settings.difficulty] ?? 25;
  const grid = emptyGrid();
  const { grid: g, nextSeed: s1 } = placeViruses(grid, count, seed);
  const { colors: nextColors, nextSeed: s2 } = randomColors(s1);
  const { colors: currentColors, nextSeed: s3 } = randomColors(s2);
  return {
    settings,
    grid: g,
    current: spawnCapsule(currentColors),
    next: nextColors,
    score: 0,
    virusCount: virusCount(g),
    over: false,
    won: false,
    rngSeed: s3,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function lockAndSpawn(state: DrMarioState): DrMarioState {
  let grid = lockCapsule(state.grid, state.current!);
  let totalScore = 0;
  while (true) {
    const matched = findMatchCells(grid);
    if (matched.size === 0) break;
    totalScore += matched.size * 25;
    const newGrid = grid.map((r) => [...r]) as Grid;
    for (const key of matched) {
      const [r, c] = key.split(",").map(Number) as [number, number];
      newGrid[r]![c] = null;
    }
    grid = applyGravity(newGrid);
  }

  const remaining = virusCount(grid);
  if (remaining === 0) {
    return { ...state, grid, score: state.score + totalScore + 1000, virusCount: 0, current: null, won: true, over: true };
  }

  const { colors: nextColors, nextSeed } = randomColors(state.rngSeed);
  const newCurrent = spawnCapsule(state.next);

  if (!canPlace(grid, newCurrent)) {
    return { ...state, grid, score: state.score + totalScore, virusCount: remaining, over: true };
  }

  return {
    ...state,
    grid,
    current: newCurrent,
    next: nextColors,
    score: state.score + totalScore,
    virusCount: remaining,
    rngSeed: nextSeed,
  };
}

export function reducer(state: DrMarioState, action: DrMarioAction): DrMarioState {
  if (state.over || !state.current) return state;
  const cap = state.current;

  switch (action.type) {
    case "left": {
      const moved = { ...cap, col: cap.col - 1 };
      if (!canPlace(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "right": {
      const moved = { ...cap, col: cap.col + 1 };
      if (!canPlace(state.grid, moved)) return state;
      return { ...state, current: moved };
    }

    case "rotate": {
      // Rotate: vertical → horizontal, horizontal → vertical (90° CW)
      // Also swap colors on rotate
      let newCap: Capsule;
      if (cap.orientation === "horizontal") {
        newCap = { ...cap, orientation: "vertical", colors: [cap.colors[1], cap.colors[0]] };
      } else {
        newCap = { ...cap, orientation: "horizontal", colors: [cap.colors[1], cap.colors[0]] };
        // Make sure it fits horizontally (needs col+1 to be free)
        if (newCap.col + 1 >= COLS) newCap = { ...newCap, col: COLS - 2 };
      }
      if (!canPlace(state.grid, newCap)) return state;
      return { ...state, current: newCap };
    }

    case "down": {
      const moved = { ...cap, row: cap.row + 1 };
      if (!canPlace(state.grid, moved)) return lockAndSpawn(state);
      return { ...state, current: moved };
    }

    case "drop": {
      let cur = cap;
      while (canPlace(state.grid, { ...cur, row: cur.row + 1 })) {
        cur = { ...cur, row: cur.row + 1 };
      }
      return lockAndSpawn({ ...state, current: cur });
    }

    case "tick": {
      const moved = { ...cap, row: cap.row + 1 };
      if (!canPlace(state.grid, moved)) return lockAndSpawn(state);
      return { ...state, current: moved };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DrMarioState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { findMatchCells, capsuleCells, canPlace };
