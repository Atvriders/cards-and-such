// ─── Kyodai (Mahjong Connect) state ─────────────────────────────────────────
// 12×8 grid of tiles (36 pairs). Connect matching tiles with a path ≤2 turns.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 12;
export const ROWS = 8;
export const TILE_TYPES = 36; // 36 pairs = 72 tiles

export interface KyodaiSettings {
  shuffle: boolean;
}

export interface KyodaiState {
  settings: KyodaiSettings;
  grid: (number | null)[][]; // ROWS x COLS
  selected: [number, number] | null;
  moves: number;
  score: number;
  over: boolean;
  won: boolean;
  timeLimit: number;
}

export type KyodaiAction =
  | { type: "select"; row: number; col: number }
  | { type: "tick" };

function cellKey(r: number, c: number): string { return `${r},${c}`; }

function makeTiles(rng: () => number): (number | null)[][] {
  const tiles: number[] = [];
  for (let t = 0; t < TILE_TYPES; t++) {
    tiles.push(t, t); // two of each
  }
  // Shuffle
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j]!, tiles[i]!];
  }
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => tiles[r * COLS + c] ?? null)
  );
}

// Path finding: can connect with at most 2 turns (3 straight segments)
export function canConnect(
  grid: (number | null)[][],
  r1: number, c1: number,
  r2: number, c2: number
): boolean {
  if (grid[r1]![c1] !== grid[r2]![c2]) return false;
  if (r1 === r2 && c1 === c2) return false;

  // Helper: check if a straight line segment is clear (exclusive of endpoints)
  function clearH(r: number, cFrom: number, cTo: number): boolean {
    const [lo, hi] = cFrom < cTo ? [cFrom + 1, cTo] : [cTo + 1, cFrom];
    for (let c = lo; c < hi; c++) if (grid[r]![c] !== null) return false;
    return true;
  }
  function clearV(c: number, rFrom: number, rTo: number): boolean {
    const [lo, hi] = rFrom < rTo ? [rFrom + 1, rTo] : [rTo + 1, rFrom];
    for (let r = lo; r < hi; r++) if (grid[r]![c] !== null) return false;
    return true;
  }

  // 0 turns: same row or column, straight clear line
  if (r1 === r2 && clearH(r1, c1, c2)) return true;
  if (c1 === c2 && clearV(c1, r1, r2)) return true;

  // 1 turn: L-shape via (r1,c2) or (r2,c1)
  if (grid[r1]![c2] === null && clearH(r1, c1, c2) && clearV(c2, r1, r2)) return true;
  if (grid[r2]![c1] === null && clearV(c1, r1, r2) && clearH(r2, c1, c2)) return true;

  // 2 turns: scan via intermediate row or column (outside grid allowed = row -1, ROWS, col -1, COLS)
  // Via horizontal corridor at row rMid
  for (let rMid = -1; rMid <= ROWS; rMid++) {
    if (rMid === r1 || rMid === r2) continue;
    const inBounds = rMid >= 0 && rMid < ROWS;
    // Check (r1,c1) -> (rMid,c1) -> (rMid,c2) -> (r2,c2)
    const seg1V = inBounds ? clearV(c1, r1, rMid) && grid[rMid]![c1] === null : true;
    const seg2H = inBounds ? clearH(rMid, c1, c2) : true;
    const seg3V = inBounds ? clearV(c2, rMid, r2) && grid[rMid]![c2] === null : true;
    if (!inBounds) {
      // Outside grid: always clear
      if (clearV(c1, r1, (rMid < 0 ? 0 : ROWS - 1)) && clearH(-1 /* not in grid */, c1, c2) && clearV(c2, (rMid < 0 ? 0 : ROWS - 1), r2)) {
        // simplified outside check
      }
      continue;
    }
    if (seg1V && seg2H && seg3V) return true;
  }

  // Via vertical corridor at col cMid
  for (let cMid = -1; cMid <= COLS; cMid++) {
    if (cMid === c1 || cMid === c2) continue;
    const inBounds = cMid >= 0 && cMid < COLS;
    if (!inBounds) continue;
    const seg1H = clearH(r1, c1, cMid) && grid[r1]![cMid] === null;
    const seg2V = clearV(cMid, r1, r2);
    const seg3H = clearH(r2, cMid, c2) && grid[r2]![cMid] === null;
    if (seg1H && seg2V && seg3H) return true;
  }

  return false;
}

function hasAnyMove(grid: (number | null)[][]): boolean {
  const cells: [number, number, number][] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r]![c] !== null) cells.push([r, c, grid[r]![c]!]);

  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      if (cells[i]![2] === cells[j]![2]) {
        if (canConnect(grid, cells[i]![0], cells[i]![1], cells[j]![0], cells[j]![1])) return true;
      }
    }
  }
  return false;
}

function isBoardClear(grid: (number | null)[][]): boolean {
  return grid.every((row) => row.every((c) => c === null));
}

export function initialState(seed: number, settings: KyodaiSettings): KyodaiState {
  const rng = mulberry32(seed);
  const grid = makeTiles(rng);
  return {
    settings,
    grid,
    selected: null,
    moves: 0,
    score: 0,
    over: false,
    won: false,
    timeLimit: 300,
  };
}

export function reducer(state: KyodaiState, action: KyodaiAction): KyodaiState {
  if (state.over) return state;

  switch (action.type) {
    case "select": {
      const { row, col } = action;
      if (state.grid[row]![col] === null) return { ...state, selected: null };

      if (state.selected === null) {
        return { ...state, selected: [row, col] };
      }

      const [sr, sc] = state.selected;
      if (sr === row && sc === col) return { ...state, selected: null };

      if (!canConnect(state.grid, sr, sc, row, col)) {
        return { ...state, selected: [row, col] };
      }

      // Remove the pair
      const grid = state.grid.map((r) => [...r]);
      grid[sr]![sc] = null;
      grid[row]![col] = null;

      const moves = state.moves + 1;
      const score = state.score + 100;
      const won = isBoardClear(grid);
      const over = won || !hasAnyMove(grid);

      return { ...state, grid, selected: null, moves, score, over, won };
    }
    case "tick":
      return state; // time handled externally
    default:
      return state;
  }
}

export function isTerminal(state: KyodaiState): { score: number } | null {
  if (state.over) return { score: state.score + (state.won ? 500 : 0) };
  return null;
}
