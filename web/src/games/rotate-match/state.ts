// ─── Rotate Match state ────────────────────────────────────────────────────────
// 6×6 grid. Rotate any 2×2 block (CW or CCW). Form 3-in-a-row/col to score.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 6;
export const NUM_COLORS = 5;

export interface RotateMatchSettings {
  moves: "20" | "30" | "40";
}

export interface RotateMatchState {
  settings: RotateMatchSettings;
  grid: number[][];
  score: number;
  moves: number;
  maxMoves: number;
  over: boolean;
}

export type RotateMatchAction =
  | { type: "rotate"; row: number; col: number; dir: "cw" | "ccw" };

function makeGrid(seed: number): number[][] {
  const rng = mulberry32(seed);
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => Math.floor(rng() * NUM_COLORS))
  );
}

// Rotate 2×2 block at top-left (row, col) clockwise
function rotate2x2CW(grid: number[][], r: number, c: number): number[][] {
  const next = grid.map((row) => [...row]);
  const [tl, tr, bl, br] = [grid[r]![c]!, grid[r]![c + 1]!, grid[r + 1]![c]!, grid[r + 1]![c + 1]!];
  next[r]![c] = bl;
  next[r]![c + 1] = tl;
  next[r + 1]![c] = br;
  next[r + 1]![c + 1] = tr;
  return next;
}

function rotate2x2CCW(grid: number[][], r: number, c: number): number[][] {
  const next = grid.map((row) => [...row]);
  const [tl, tr, bl, br] = [grid[r]![c]!, grid[r]![c + 1]!, grid[r + 1]![c]!, grid[r + 1]![c + 1]!];
  next[r]![c] = tr;
  next[r]![c + 1] = br;
  next[r + 1]![c] = tl;
  next[r + 1]![c + 1] = bl;
  return next;
}

export function findMatches(grid: number[][]): Set<string> {
  const matched = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  // Horizontal
  for (let r = 0; r < SIZE; r++) {
    let run = 1;
    for (let c = 1; c < SIZE; c++) {
      if (grid[r]![c] === grid[r]![c - 1]) { run++; }
      else { run = 1; }
      if (run >= 3) {
        for (let k = c - run + 1; k <= c; k++) matched.add(key(r, k));
      }
    }
  }

  // Vertical
  for (let c = 0; c < SIZE; c++) {
    let run = 1;
    for (let r = 1; r < SIZE; r++) {
      if (grid[r]![c] === grid[r - 1]![c]) { run++; }
      else { run = 1; }
      if (run >= 3) {
        for (let k = r - run + 1; k <= r; k++) matched.add(key(k, c));
      }
    }
  }

  return matched;
}

function clearAndRefill(grid: number[][], matched: Set<string>, seed: number): number[][] {
  const rng = mulberry32(seed);
  const next = grid.map((row) => [...row]);
  for (const k of matched) {
    const [r, c] = k.split(",").map(Number) as [number, number];
    next[r]![c] = Math.floor(rng() * NUM_COLORS);
  }
  return next;
}

export function initialState(seed: number, settings: RotateMatchSettings): RotateMatchState {
  const maxMoves = parseInt(settings.moves, 10);
  return {
    settings,
    grid: makeGrid(seed),
    score: 0,
    moves: 0,
    maxMoves,
    over: false,
  };
}

export function reducer(state: RotateMatchState, action: RotateMatchAction): RotateMatchState {
  if (state.over) return state;

  switch (action.type) {
    case "rotate": {
      const { row, col, dir } = action;
      if (row < 0 || row >= SIZE - 1 || col < 0 || col >= SIZE - 1) return state;

      let grid = dir === "cw"
        ? rotate2x2CW(state.grid, row, col)
        : rotate2x2CCW(state.grid, row, col);

      const matched = findMatches(grid);
      let score = state.score;
      if (matched.size > 0) {
        score += matched.size * 10;
        grid = clearAndRefill(grid, matched, state.moves * 131 + 42);
      }

      const moves = state.moves + 1;
      const over = moves >= state.maxMoves;

      return { ...state, grid, score, moves, over };
    }
    default:
      return state;
  }
}

export function isTerminal(state: RotateMatchState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
