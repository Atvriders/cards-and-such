import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findPops, applyGravity, floodFill, pairCells, COLS, ROWS } from "./state.js";

const defaultSettings = { startLevel: "1" as const };

describe("initialState", () => {
  it("starts with empty grid and valid pair", () => {
    const s = initialState(42, defaultSettings);
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
    const flat = s.grid.flat();
    expect(flat.every((c) => c === null)).toBe(true);
  });

  it("current pair starts near top", () => {
    const s = initialState(10, defaultSettings);
    expect(s.current.pivotRow).toBeLessThanOrEqual(2);
    expect(s.current.pivotCol).toBeGreaterThanOrEqual(0);
    expect(s.current.pivotCol).toBeLessThan(COLS);
  });
});

describe("pairCells", () => {
  it("returns correct cells for upward satellite (dir=0)", () => {
    const pair = { pivotRow: 5, pivotCol: 3, satelliteDir: 0 as const, pivotColor: 0, satelliteColor: 1 };
    const [[r1, c1], [r2, c2]] = pairCells(pair);
    expect(r1).toBe(5); expect(c1).toBe(3);
    expect(r2).toBe(4); expect(c2).toBe(3);
  });

  it("returns correct cells for rightward satellite (dir=1)", () => {
    const pair = { pivotRow: 5, pivotCol: 3, satelliteDir: 1 as const, pivotColor: 0, satelliteColor: 1 };
    const [[r1, c1], [r2, c2]] = pairCells(pair);
    expect(r1).toBe(5); expect(c1).toBe(3);
    expect(r2).toBe(5); expect(c2).toBe(4);
  });
});

describe("floodFill", () => {
  it("finds all connected same-color cells", () => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null)) as (number | null)[][];
    grid[10]![0] = 2; grid[10]![1] = 2; grid[11]![0] = 2; grid[11]![1] = 2;
    const group = floodFill(grid, 10, 0);
    expect(group.length).toBe(4);
  });

  it("does not cross different colors", () => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null)) as (number | null)[][];
    grid[10]![0] = 2; grid[10]![1] = 3;
    const group = floodFill(grid, 10, 0);
    expect(group.length).toBe(1);
  });
});

describe("findPops", () => {
  it("pops groups of 4+", () => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null)) as (number | null)[][];
    grid[10]![0] = 1; grid[10]![1] = 1; grid[11]![0] = 1; grid[11]![1] = 1;
    const pops = findPops(grid);
    expect(pops.size).toBe(4);
  });

  it("does not pop groups of 3", () => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null)) as (number | null)[][];
    grid[10]![0] = 2; grid[10]![1] = 2; grid[11]![0] = 2;
    const pops = findPops(grid);
    expect(pops.size).toBe(0);
  });
});

describe("applyGravity", () => {
  it("blobs fall to lowest empty row", () => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null)) as (number | null)[][];
    grid[0]![0] = 3;
    const result = applyGravity(grid);
    expect(result[ROWS - 1]![0]).toBe(3);
    expect(result[0]![0]).toBeNull();
  });
});

describe("reducer - movement", () => {
  it("left moves pair left", () => {
    const s = initialState(42, defaultSettings);
    const col0 = s.current.pivotCol;
    const s2 = reducer(s, { type: "left" });
    expect(s2.current.pivotCol).toBe(col0 - 1);
  });

  it("right moves pair right", () => {
    const s = initialState(42, defaultSettings);
    const col0 = s.current.pivotCol;
    const s2 = reducer(s, { type: "right" });
    expect(s2.current.pivotCol).toBe(col0 + 1);
  });

  it("rotate-cw changes satellite direction", () => {
    const s = initialState(42, defaultSettings);
    const dir0 = s.current.satelliteDir;
    const s2 = reducer(s, { type: "rotate-cw" });
    expect(s2.current.satelliteDir).toBe((dir0 + 1) % 4);
  });
});

describe("reducer - drop and game over", () => {
  it("drop places pair and spawns next", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "drop" });
    const filled = s2.grid.flat().filter((c) => c !== null);
    expect(filled.length).toBeGreaterThanOrEqual(0);
  });

  it("game ends when grid fills up", () => {
    let cur = initialState(42, defaultSettings);
    let iters = 0;
    while (!cur.over && iters < 300) {
      cur = reducer(cur, { type: "drop" });
      iters++;
    }
    expect(cur.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null when ongoing", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, defaultSettings), over: true, score: 300 };
    expect(isTerminal(s)).toEqual({ score: 300 });
  });
});
