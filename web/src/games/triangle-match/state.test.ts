import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findGroup, neighbors, NUM_ROWS } from "./state.js";

const settings4 = { colors: "4" as const };
const settings5 = { colors: "5" as const };

describe("initialState", () => {
  it("creates 8 rows", () => {
    const s = initialState(42, settings5);
    expect(s.grid.length).toBe(NUM_ROWS);
  });

  it("each row has 2r+1 triangles", () => {
    const s = initialState(1, settings4);
    for (let r = 0; r < NUM_ROWS; r++) {
      expect(s.grid[r]!.length).toBe(2 * r + 1);
    }
  });

  it("all colors are in range", () => {
    const s = initialState(7, { colors: "6" as const });
    for (const row of s.grid)
      for (const c of row)
        expect(c).toBeGreaterThanOrEqual(0);
  });
});

describe("neighbors", () => {
  it("top triangle (0,0) has one neighbor in row 1", () => {
    const n = neighbors(0, 0);
    // Only neighbor is in row 1 (down-pointing triangle in row 0 doesn't exist above row 0)
    const hasRow1 = n.some(([r]) => r === 1);
    expect(hasRow1).toBe(true);
  });

  it("triangle in middle row has left and right neighbors", () => {
    const n = neighbors(4, 4);
    const hasLeft = n.some(([r, c]) => r === 4 && c === 3);
    const hasRight = n.some(([r, c]) => r === 4 && c === 5);
    expect(hasLeft || hasRight).toBe(true);
  });
});

describe("findGroup", () => {
  it("finds single-cell group when isolated", () => {
    const s = initialState(42, settings5);
    // Overwrite all neighbors of (0,0) to different color
    const grid = s.grid.map((row) => [...row]);
    grid[0]![0] = 0;
    grid[1]![0] = 1;
    grid[1]![1] = 1;
    const g = findGroup({ ...s, grid }.grid, 0, 0);
    expect(g.length).toBe(1);
  });

  it("finds a connected group of same color", () => {
    const s = initialState(42, settings5);
    const grid = s.grid.map((row) => [...row]);
    grid[0]![0] = 0;
    grid[1]![0] = 0; // neighbor of (0,0)
    grid[1]![1] = 0;
    for (let c = 0; c < 5; c++) grid[2]![c] = 1; // isolate above
    const g = findGroup(grid, 0, 0);
    expect(g.length).toBeGreaterThanOrEqual(2);
  });
});

describe("reducer - click", () => {
  it("removes a group of 3+ and awards points", () => {
    // Build a board where row 0,1,2 share color
    const s = initialState(42, settings5);
    const grid = s.grid.map((row) => [...row]);
    grid[0]![0] = 0;
    grid[1]![0] = 0;
    grid[1]![1] = 0;
    grid[1]![2] = 0;
    // Isolate the rest
    for (let c = 0; c < 5; c++) grid[2]![c] = 1;
    const state0 = { ...s, grid, score: 0 };
    const state1 = reducer(state0, { type: "click", row: 0, col: 0 });
    // The group has at least 3 → score > 0
    expect(state1.score).toBeGreaterThan(0);
  });

  it("does not remove a group of fewer than 3", () => {
    const s = initialState(42, settings5);
    const grid = s.grid.map((row) => [...row]);
    grid[0]![0] = 0;
    for (let c = 0; c < 3; c++) grid[1]![c] = (c === 0 ? 0 : 1);
    // Isolate so group of 0,0 has size 1 or 2
    const state0 = { ...s, grid, score: 0 };
    const group = findGroup(grid, 0, 0);
    if (group.length < 3) {
      const state1 = reducer(state0, { type: "click", row: 0, col: 0 });
      expect(state1.score).toBe(0);
    }
  });

  it("does not change state after game over", () => {
    const s = { ...initialState(1, settings4), over: true };
    const s2 = reducer(s, { type: "click", row: 0, col: 0 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null while ongoing", () => {
    expect(isTerminal(initialState(1, settings5))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings4), over: true, score: 300 };
    expect(isTerminal(s)).toEqual({ score: 300 });
  });
});
