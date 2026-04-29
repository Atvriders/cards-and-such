import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROWS = 6;
export const COLS = 6;
export const TIMER_TICKS = 60;
export const NUM_COLORS = 6;

export interface PuyoTsuMiniSettings { dummy: boolean; }

export type Cell = number;
export type Grid = Cell[][];

export interface PuyoTsuMiniState {
  rngSeed: number;
  grid: Grid;
  selected: [number, number] | null;
  ticksRemaining: number;
  score: number;
  matches: number;
  phase: "playing" | "done";
}

export type PuyoTsuMiniAction =
  | { type: "tick" }
  | { type: "select"; row: number; col: number };

function randomGem(rng: () => number): number { return Math.floor(rng() * NUM_COLORS); }

function makeGrid(seed: number): { grid: Grid; nextSeed: number } {
  const rng = mulberry32(seed);
  let grid: Grid;
  let attempts = 0;
  do {
    grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => randomGem(rng)));
    attempts++;
  } while (findMatches(grid).size > 0 && attempts < 20);
  const nextSeed = (seed * 1664525 + 1013904223) >>> 0;
  return { grid, nextSeed };
}

function findMatches(grid: Grid): Set<string> {
  const matched = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS) {
      const color = grid[r]![c]!;
      let len = 1;
      while (c + len < COLS && grid[r]![c + len] === color) len++;
      if (len >= 3) for (let k = 0; k < len; k++) matched.add(`${r},${c + k}`);
      c += len;
    }
  }
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS) {
      const color = grid[r]![c]!;
      let len = 1;
      while (r + len < ROWS && grid[r + len]![c] === color) len++;
      if (len >= 3) for (let k = 0; k < len; k++) matched.add(`${r + k},${c}`);
      r += len;
    }
  }
  return matched;
}

function clearAndRefill(grid: Grid, rng: () => number): { newGrid: Grid; cleared: number } {
  const matched = findMatches(grid);
  if (matched.size === 0) return { newGrid: grid, cleared: 0 };
  const next = grid.map(row => [...row]);
  for (const key of matched) {
    const parts = key.split(",");
    const r = parseInt(parts[0]!, 10);
    const c = parseInt(parts[1]!, 10);
    next[r]![c] = -1;
  }
  for (let c = 0; c < COLS; c++) {
    const stack: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r]![c] !== -1) stack.push(next[r]![c]!);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      next[r]![c] = stack.length > 0 ? stack.shift()! : randomGem(rng);
    }
  }
  return { newGrid: next, cleared: matched.size };
}

export function initialState(seed: number, _settings: PuyoTsuMiniSettings): PuyoTsuMiniState {
  const { grid, nextSeed } = makeGrid(seed);
  return { rngSeed: nextSeed, grid, selected: null, ticksRemaining: TIMER_TICKS, score: 0, matches: 0, phase: "playing" };
}

export function reducer(state: PuyoTsuMiniState, action: PuyoTsuMiniAction): PuyoTsuMiniState {
  if (state.phase === "done") return state;
  if (action.type === "tick") {
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, ticksRemaining, phase };
  }
  if (action.type === "select") {
    const { row, col } = action;
    if (!state.selected) return { ...state, selected: [row, col] };
    const [sr, sc] = state.selected;
    const dr = Math.abs(row - sr);
    const dc = Math.abs(col - sc);
    const adjacent = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    if (!adjacent) return { ...state, selected: [row, col] };
    const newGrid = state.grid.map(r => [...r]);
    const tmp = newGrid[sr]![sc]!;
    newGrid[sr]![sc] = newGrid[row]![col]!;
    newGrid[row]![col] = tmp;
    const matches = findMatches(newGrid);
    if (matches.size === 0) return { ...state, selected: null };
    const rng = mulberry32(state.rngSeed);
    let grid = newGrid;
    let totalCleared = 0;
    let cascades = 0;
    while (true) {
      const result = clearAndRefill(grid, rng);
      if (result.cleared === 0) break;
      totalCleared += result.cleared;
      cascades++;
      grid = result.newGrid;
      if (cascades > 12) break;
    }
    const newSeed = (state.rngSeed * 1664525 + 1013904223) >>> 0;
    return { ...state, grid, selected: null, score: state.score + totalCleared * 10, matches: state.matches + 1, rngSeed: newSeed };
  }
  return state;
}

export function isTerminal(state: PuyoTsuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

export { findMatches };
