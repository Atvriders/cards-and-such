import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findGroup, hasValidMoves, popScore, COLS, ROWS } from "./state.js";
import type { Grid } from "./state.js";

const settings = { colors: "4" as const };

describe("initialState", () => {
  it("creates 8x8 grid fully filled", () => {
    const s = initialState(42, settings);
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
    expect(s.grid.flat().every((c) => c !== null)).toBe(true);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("findGroup", () => {
  it("finds connected same-color cells", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    grid[0]![0] = 1; // isolated different color
    const group = findGroup(grid, 1, 0);
    expect(group.every(([r, c]) => !(r === 0 && c === 0))).toBe(true);
  });

  it("returns empty for null cell", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    expect(findGroup(grid, 0, 0)).toEqual([]);
  });
});

describe("popScore", () => {
  it("n*(n-1)*bonus", () => {
    expect(popScore(2, 0)).toBe(2); // 2*1*1
    expect(popScore(3, 0)).toBe(6); // 3*2*1
    expect(popScore(2, 1)).toBe(3); // 2*1*1.5 = 3
  });
});

describe("reducer — pop", () => {
  it("removes a group and scores", () => {
    const s = initialState(7, settings);
    let found: [number, number] | null = null;
    outer: for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (findGroup(s.grid, r, c).length >= 2) { found = [r, c]; break outer; }
      }
    }
    expect(found).not.toBeNull();
    const s2 = reducer(s, { type: "pop", row: found![0], col: found![1] });
    expect(s2.score).toBeGreaterThan(0);
  });

  it("rejects single-balloon click", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    grid[4]![4] = 0;
    // Surround it with 1s (already 1s), but isolate it by making all neighbors different
    const s = { ...initialState(1, settings), grid };
    // Set all neighbors to different color
    grid[3]![4] = 1; grid[5]![4] = 1; grid[4]![3] = 1; grid[4]![5] = 1;
    // The center cell 0 is surrounded by 1s - it's an isolated 0
    const s2 = reducer(s, { type: "pop", row: 4, col: 4 });
    // findGroup of isolated 0 returns 1 cell -> rejected
    expect(s2.score).toBe(s.score);
  });

  it("game over when board cleared", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[ROWS - 1]![0] = 0;
    grid[ROWS - 1]![1] = 0;
    const s = { ...initialState(1, settings), grid };
    const s2 = reducer(s, { type: "pop", row: ROWS - 1, col: 0 });
    expect(s2.over).toBe(true);
  });

  it("no-op when already over", () => {
    const s = { ...initialState(1, settings), over: true };
    const s2 = reducer(s, { type: "pop", row: 0, col: 0 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 200 };
    expect(isTerminal(s)!.score).toBe(200);
  });
});
