import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROWS, COLS } from "./state.js";

const settings = { colors: "4" as const };

describe("initialState", () => {
  it("creates grid with correct dimensions and partial fill", () => {
    const s = initialState(42, settings);
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("determinism", () => {
  it("same seed produces same grid", () => {
    const s1 = initialState(55, settings);
    const s2 = initialState(55, settings);
    // Compare alive bubbles in bottom row
    for (let c = 0; c < COLS; c++) {
      expect(s1.grid[ROWS - 1]![c]!.color).toBe(s2.grid[ROWS - 1]![c]!.color);
    }
  });
});

describe("pop action", () => {
  it("pops a chain of 2+ same color and increases score", () => {
    const s = initialState(42, settings);
    // Force two adjacent same-color bubbles in bottom row
    const grid = s.grid.map((row) => row.map((b) => ({ ...b })));
    grid[ROWS - 1]![0]!.alive = true;
    grid[ROWS - 1]![0]!.color = "red";
    grid[ROWS - 1]![1]!.alive = true;
    grid[ROWS - 1]![1]!.color = "red";
    const forced = { ...s, grid };
    const after = reducer(forced, { type: "pop", row: ROWS - 1, col: 0 });
    expect(after.score).toBeGreaterThan(0);
    expect(after.grid[ROWS - 1]![0]!.alive).toBe(false);
    expect(after.grid[ROWS - 1]![1]!.alive).toBe(false);
  });

  it("single isolated bubble does not pop", () => {
    const s = initialState(42, settings);
    const grid = s.grid.map((row) => row.map((b) => ({ ...b, alive: false })));
    grid[5]![5]!.alive = true;
    grid[5]![5]!.color = "blue";
    const isolated = { ...s, grid };
    const after = reducer(isolated, { type: "pop", row: 5, col: 5 });
    expect(after.score).toBe(0);
    expect(after.grid[5]![5]!.alive).toBe(true);
  });
});

describe("tick advances timer and eventually adds row", () => {
  it("adds a new row at top after moveInterval", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: s.moveInterval + 0.1 });
    // Row 0 should now have alive bubbles
    const hasNewRow = after.grid[0]!.some((b) => b.alive);
    expect(hasNewRow).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null in progress", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
  it("score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 120 };
    expect(isTerminal(s)).toEqual({ score: 120 });
  });
});
