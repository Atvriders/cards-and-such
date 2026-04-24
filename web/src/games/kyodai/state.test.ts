import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canConnect, ROWS, COLS, TILE_TYPES } from "./state.js";

const settings = { shuffle: false };

describe("initialState", () => {
  it("creates a 12×8 grid", () => {
    const s = initialState(42, settings);
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
  });

  it("has exactly 2 of each tile type", () => {
    const s = initialState(42, settings);
    const counts = new Map<number, number>();
    for (const row of s.grid)
      for (const cell of row)
        if (cell !== null)
          counts.set(cell, (counts.get(cell) ?? 0) + 1);
    for (let t = 0; t < TILE_TYPES; t++) {
      expect(counts.get(t)).toBe(2);
    }
  });

  it("starts with score 0 and not over", () => {
    const s = initialState(1, settings);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("canConnect", () => {
  it("connects same-color tiles with a straight path", () => {
    const grid: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = 1;
    grid[0]![5] = 1;
    expect(canConnect(grid, 0, 0, 0, 5)).toBe(true);
  });

  it("rejects tiles of different types", () => {
    const grid: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = 1;
    grid[0]![3] = 2;
    expect(canConnect(grid, 0, 0, 0, 3)).toBe(false);
  });

  it("rejects same cell as start and end", () => {
    const grid: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = 1;
    expect(canConnect(grid, 0, 0, 0, 0)).toBe(false);
  });

  it("allows L-shaped path", () => {
    const grid: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = 1;
    grid[2]![3] = 1;
    // No blockers — L-path via (0,3) or (2,0)
    expect(canConnect(grid, 0, 0, 2, 3)).toBe(true);
  });
});

describe("reducer - select", () => {
  it("selects a tile", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "select", row: 0, col: 0 });
    expect(s2.selected).toEqual([0, 0]);
  });

  it("removes pair when match found", () => {
    // Build grid with matching pair that can connect
    const grid: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = 5;
    grid[0]![3] = 5;
    const s = { ...initialState(1, settings), grid };
    const s2 = reducer(s, { type: "select", row: 0, col: 0 });
    const s3 = reducer(s2, { type: "select", row: 0, col: 3 });
    expect(s3.grid[0]![0]).toBeNull();
    expect(s3.grid[0]![3]).toBeNull();
    expect(s3.score).toBe(100);
  });
});

describe("isTerminal", () => {
  it("returns null while ongoing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, won: true, score: 400 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(900);
  });
});
