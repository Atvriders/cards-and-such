// ─── Drop7-like state ─────────────────────────────────────────────────────────
// 7×7 grid. Numbered discs (1-7) drop into a chosen column.
// A disc clears if there are exactly N discs in its row OR column.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 7;
export const ROWS = 7;

export type Cell = { value: number } | "blank" | null;
// value: 1-7 numbered disc; "blank": cracked disc with no number; null: empty

export type Grid = Cell[][];

export interface Drop7Settings {
  speed: "normal" | "fast";
}

export interface Drop7State {
  settings: Drop7Settings;
  grid: Grid;
  next: number; // 1-7
  score: number;
  level: number;
  discsDropped: number;
  over: boolean;
  rngSeed: number;
}

export type Drop7Action =
  | { type: "drop"; col: number };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function advSeed(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

function randomDisc(seed: number): { value: number; nextSeed: number } {
  const next = advSeed(seed);
  return { value: (next % 7) + 1, nextSeed: next };
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// Count non-null, non-blank discs in a row
function discCountInRow(grid: Grid, row: number): number {
  let n = 0;
  for (let c = 0; c < COLS; c++) {
    const cell = grid[row]![c];
    if (cell !== null && cell !== "blank") n++;
  }
  return n;
}

// Count non-null, non-blank discs in a column
function discCountInCol(grid: Grid, col: number): number {
  let n = 0;
  for (let r = 0; r < ROWS; r++) {
    const cell = grid[r]![col];
    if (cell !== null && cell !== "blank") n++;
  }
  return n;
}

// Find all cells that should clear (disc with value N in row/col with exactly N discs)
function findClears(grid: Grid): Set<string> {
  const clears = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    const rowCount = discCountInRow(grid, r);
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r]![c];
      if (cell === null || cell === "blank") continue;
      const colCount = discCountInCol(grid, c);
      if ((cell as { value: number }).value === rowCount || (cell as { value: number }).value === colCount) {
        clears.add(`${r},${c}`);
      }
    }
  }
  return clears;
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

// Add a new row of blank discs at the bottom (existing rows shift up, top row is lost if full)
function addBlankRow(grid: Grid): Grid {
  const blankRow: Cell[] = Array.from({ length: COLS }, () => "blank");
  // Shift all rows up by 1 (row 0 disappears, new row at bottom)
  const next = [...grid.slice(1), blankRow];
  return next;
}

// The number of discs dropped before adding each blank row
function discsPerLevel(level: number): number {
  return Math.max(5, 15 - level);
}

// ─── Initial state ─────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: Drop7Settings): Drop7State {
  const { value, nextSeed } = randomDisc(seed);
  return {
    settings,
    grid: emptyGrid(),
    next: value,
    score: 0,
    level: 1,
    discsDropped: 0,
    over: false,
    rngSeed: nextSeed,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: Drop7State, action: Drop7Action): Drop7State {
  if (state.over) return state;

  switch (action.type) {
    case "drop": {
      const { col } = action;
      if (col < 0 || col >= COLS) return state;

      // Find the lowest empty row in the chosen column
      let targetRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (state.grid[r]![col] === null) { targetRow = r; break; }
      }
      if (targetRow < 0) return state; // column is full

      // Place disc
      let grid = state.grid.map((r) => [...r]);
      grid[targetRow]![col] = { value: state.next };

      // Process clears repeatedly (cascade)
      let totalScore = 0;
      let cleared = true;
      while (cleared) {
        const clears = findClears(grid);
        if (clears.size === 0) { cleared = false; break; }
        // Blank discs crack first — they become null on first clear trigger near them
        // Simplified: cleared discs with values score; blanks just disappear
        for (const key of clears) {
          const [r, c] = key.split(",").map(Number) as [number, number];
          const cell = grid[r]![c];
          if (cell !== null && cell !== "blank") {
            totalScore += (cell as { value: number }).value;
          }
          grid[r]![c] = null;
        }
        grid = applyGravity(grid);
      }

      const discsDropped = state.discsDropped + 1;
      const threshold = discsPerLevel(state.level);
      let level = state.level;
      let finalGrid = grid;

      if (discsDropped % threshold === 0) {
        finalGrid = addBlankRow(grid);
        level = state.level + 1;
      }

      // Check game over: top row has any non-null cell
      const isOver = finalGrid[0]!.some((cell) => cell !== null);

      const { value, nextSeed } = randomDisc(state.rngSeed);

      return {
        ...state,
        grid: finalGrid,
        next: value,
        score: state.score + totalScore,
        level,
        discsDropped,
        over: isOver,
        rngSeed: nextSeed,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: Drop7State): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { findClears, applyGravity, addBlankRow, discCountInRow, discCountInCol };
