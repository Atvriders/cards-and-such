// ─── Match-3 (Bejeweled-like) state ──────────────────────────────────────────
// 8×8 grid of gems. Player swaps adjacent gems to create 3+ matches.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 8;
export const ROWS = 8;

export interface Match3Settings {
  moves: "30" | "50" | "100";
  colors: "5" | "6" | "7";
}

export type Cell = number | null; // 0..numColors-1, null = empty falling slot
export type Grid = Cell[][];

export interface Match3State {
  settings: Match3Settings;
  grid: Grid;
  score: number;
  movesLeft: number;
  over: boolean;
  selected: [number, number] | null; // [row, col] of selected gem
  rngSeed: number;
  numColors: number;
}

export type Match3Action =
  | { type: "select"; row: number; col: number }
  | { type: "settle" }; // apply gravity + fill after a match

// ─── RNG ──────────────────────────────────────────────────────────────────────
function randomGem(rng: () => number, numColors: number): number {
  return Math.floor(rng() * numColors);
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
function makeGrid(seed: number, numColors: number): { grid: Grid; nextSeed: number } {
  const rng = mulberry32(seed);
  let grid: Grid;
  let attempts = 0;
  do {
    grid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => randomGem(rng, numColors))
    );
    attempts++;
  } while (findMatches(grid).size > 0 && attempts < 20);
  // Advance seed deterministically
  const nextSeed = (seed * 1664525 + 1013904223) >>> 0;
  return { grid, nextSeed };
}

// Returns set of "r,c" strings that are part of any match
function findMatches(grid: Grid): Set<string> {
  const matched = new Set<string>();
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS) {
      const color = grid[r]![c];
      if (color === null) { c++; continue; }
      let len = 1;
      while (c + len < COLS && grid[r]![c + len] === color) len++;
      if (len >= 3) {
        for (let k = 0; k < len; k++) matched.add(`${r},${c + k}`);
      }
      c += len;
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS) {
      const color = grid[r]![c];
      if (color === null) { r++; continue; }
      let len = 1;
      while (r + len < ROWS && grid[r + len]![c] === color) len++;
      if (len >= 3) {
        for (let k = 0; k < len; k++) matched.add(`${r + k},${c}`);
      }
      r += len;
    }
  }
  return matched;
}

function scoreForMatch(count: number): number {
  if (count === 3) return 10;
  if (count === 4) return 30;
  if (count === 5) return 100;
  return 100 + (count - 5) * 50;
}

function applyGravity(grid: Grid): Grid {
  const next = grid.map((row) => [...row]);
  for (let c = 0; c < COLS; c++) {
    // Collect non-null cells in column from bottom
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

function fillEmpty(grid: Grid, rng: () => number, numColors: number): Grid {
  const next = grid.map((row) => [...row]);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (next[r]![c] === null) next[r]![c] = randomGem(rng, numColors);
    }
  }
  return next;
}

// Returns { newGrid, points } after clearing all matches (one cascade step)
function clearMatches(grid: Grid): { newGrid: Grid; points: number } {
  const matched = findMatches(grid);
  if (matched.size === 0) return { newGrid: grid, points: 0 };
  // Group by connected runs for scoring
  let points = 0;
  // Simple: count per connected horizontal/vertical stretch
  // We'll just use match count groups
  // Score = sum over each distinct match group
  const counted = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    // horizontal groups
    let c = 0;
    while (c < COLS) {
      const color = grid[r]![c];
      if (color === null || !matched.has(`${r},${c}`)) { c++; continue; }
      let len = 1;
      while (c + len < COLS && grid[r]![c + len] === color && matched.has(`${r},${c + len}`)) len++;
      if (len >= 3) {
        // Only count if not already counted vertically
        let alreadyCounted = false;
        for (let k = 0; k < len; k++) {
          if (counted.has(`${r},${c + k}`)) { alreadyCounted = true; break; }
        }
        if (!alreadyCounted) {
          points += scoreForMatch(len);
          for (let k = 0; k < len; k++) counted.add(`${r},${c + k}`);
        }
      }
      c += len;
    }
  }
  for (let c = 0; c < COLS; c++) {
    // vertical groups
    let r = 0;
    while (r < ROWS) {
      const color = grid[r]![c];
      if (color === null || !matched.has(`${r},${c}`)) { r++; continue; }
      let len = 1;
      while (r + len < ROWS && grid[r + len]![c] === color && matched.has(`${r + len},${c}`)) len++;
      if (len >= 3) {
        let alreadyCounted = false;
        for (let k = 0; k < len; k++) {
          if (counted.has(`${r + k},${c}`)) { alreadyCounted = true; break; }
        }
        if (!alreadyCounted) {
          points += scoreForMatch(len);
          for (let k = 0; k < len; k++) counted.add(`${r + k},${c}`);
        }
      }
      r += len;
    }
  }
  const newGrid = grid.map((row) => [...row]);
  for (const key of matched) {
    const [r, c] = key.split(",").map(Number) as [number, number];
    newGrid[r]![c] = null;
  }
  return { newGrid, points };
}

// ─── Initial state ─────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: Match3Settings): Match3State {
  const numColors = parseInt(settings.colors, 10);
  const movesLeft = parseInt(settings.moves, 10);
  const { grid, nextSeed } = makeGrid(seed, numColors);
  return {
    settings,
    grid,
    score: 0,
    movesLeft,
    over: false,
    selected: null,
    rngSeed: nextSeed,
    numColors,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: Match3State, action: Match3Action): Match3State {
  if (state.over) return state;

  switch (action.type) {
    case "select": {
      const { row, col } = action;
      if (!state.selected) {
        return { ...state, selected: [row, col] };
      }
      const [sr, sc] = state.selected;
      const dr = Math.abs(row - sr);
      const dc = Math.abs(col - sc);
      const isAdjacent = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
      if (!isAdjacent) {
        // Re-select
        return { ...state, selected: [row, col] };
      }
      // Try swap
      const newGrid = state.grid.map((r) => [...r]);
      const tmp = newGrid[sr]![sc]!;
      newGrid[sr]![sc] = newGrid[row]![col]!;
      newGrid[row]![col] = tmp;
      const matches = findMatches(newGrid);
      if (matches.size === 0) {
        // Invalid swap — swap back
        return { ...state, selected: null };
      }
      // Valid swap: apply, score
      let { newGrid: cleared, points } = clearMatches(newGrid);
      let cascade = 1;
      const rng = mulberry32(state.rngSeed);
      let grid = applyGravity(cleared);
      grid = fillEmpty(grid, rng, state.numColors);
      // Cascades
      let cascadePoints = 0;
      while (true) {
        const result = clearMatches(grid);
        if (result.points === 0) break;
        cascadePoints += result.points * (cascade + 1);
        cascade++;
        grid = applyGravity(result.newGrid);
        grid = fillEmpty(grid, rng, state.numColors);
      }
      const totalPoints = points + cascadePoints;
      const movesLeft = state.movesLeft - 1;
      const newSeed = (state.rngSeed * 1664525 + 1013904223) >>> 0;
      return {
        ...state,
        grid,
        score: state.score + totalPoints,
        movesLeft,
        over: movesLeft <= 0,
        selected: null,
        rngSeed: newSeed,
      };
    }

    case "settle": {
      // Re-check and clear any matches that appeared (e.g., after initial fill)
      const rng = mulberry32(state.rngSeed);
      let grid = state.grid;
      let totalPoints = 0;
      while (true) {
        const result = clearMatches(grid);
        if (result.points === 0) break;
        totalPoints += result.points;
        grid = applyGravity(result.newGrid);
        grid = fillEmpty(grid, rng, state.numColors);
      }
      const newSeed = (state.rngSeed * 1664525 + 1013904223) >>> 0;
      return { ...state, grid, score: state.score + totalPoints, rngSeed: newSeed };
    }

    default:
      return state;
  }
}

export function isTerminal(state: Match3State): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { findMatches, clearMatches, applyGravity, fillEmpty, makeGrid };
