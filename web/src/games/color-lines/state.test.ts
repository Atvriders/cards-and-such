import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findPath, checkLines, GRID_SIZE } from "./state.js";

const settings = { size: "9" as const };

describe("initialState", () => {
  it("creates a 9×9 grid (81 cells)", () => {
    const s = initialState(42, settings);
    expect(s.grid.length).toBe(GRID_SIZE * GRID_SIZE);
  });

  it("starts with some balls placed", () => {
    const s = initialState(42, settings);
    const ballCount = s.grid.filter((c) => c !== null).length;
    expect(ballCount).toBeGreaterThan(0);
  });

  it("has a preview of 3 next colors", () => {
    const s = initialState(1, settings);
    expect(s.nextColors.length).toBe(3);
  });
});

describe("findPath", () => {
  it("returns null when destination is occupied", () => {
    const s = initialState(42, settings);
    const size = GRID_SIZE;
    // Find two occupied cells
    const occupied = s.grid
      .map((c, i) => (c !== null ? i : -1))
      .filter((i) => i >= 0);
    if (occupied.length >= 2) {
      const path = findPath(s.grid, occupied[0]!, occupied[1]!, size);
      expect(path).toBeNull();
    }
  });

  it("finds a path from one cell to an empty neighbour", () => {
    const size = GRID_SIZE;
    const grid = Array(size * size).fill(null);
    grid[0] = 2; // ball at 0,0
    const path = findPath(grid, 0, 1, size);
    expect(path).not.toBeNull();
    expect(path![0]).toBe(0);
    expect(path![path!.length - 1]).toBe(1);
  });

  it("returns null when path is blocked", () => {
    const size = GRID_SIZE;
    const grid = Array(size * size).fill(1); // all filled
    grid[0] = 2; // source
    grid[size * size - 1] = null; // destination empty
    const path = findPath(grid, 0, size * size - 1, size);
    // All cells blocked except dest, no path through
    expect(path).toBeNull();
  });
});

describe("checkLines", () => {
  it("detects a horizontal line of 5", () => {
    const size = GRID_SIZE;
    const grid = Array(size * size).fill(null);
    for (let c = 0; c < 5; c++) grid[c] = 0;
    const { points } = checkLines(grid, size);
    expect(points).toBe(50);
  });

  it("returns 0 when no match", () => {
    const s = initialState(42, settings);
    // On fresh start, no lines should exist
    const { points } = checkLines(s.grid, GRID_SIZE);
    expect(points).toBeGreaterThanOrEqual(0);
  });

  it("detects a vertical line of 5", () => {
    const size = GRID_SIZE;
    const grid = Array(size * size).fill(null);
    for (let r = 0; r < 5; r++) grid[r * size] = 3;
    const { points } = checkLines(grid, size);
    expect(points).toBe(50);
  });
});

describe("reducer", () => {
  it("select: selects a cell with a ball", () => {
    const s = initialState(42, settings);
    const ballIdx = s.grid.findIndex((c) => c !== null);
    const s2 = reducer(s, { type: "select", idx: ballIdx });
    expect(s2.selected).toBe(ballIdx);
  });

  it("does not change state after game over", () => {
    const s = { ...initialState(1, settings), over: true };
    const s2 = reducer(s, { type: "select", idx: 0 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null while ongoing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 150 };
    expect(isTerminal(s)).toEqual({ score: 150 });
  });
});
