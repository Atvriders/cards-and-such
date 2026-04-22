import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findClears, applyGravity, addBlankRow, discCountInRow, discCountInCol, COLS, ROWS } from "./state.js";
import type { Drop7State, Grid } from "./state.js";

const defaultSettings = { speed: "normal" as const };

describe("initialState", () => {
  it("creates an empty 7×7 grid", () => {
    const s = initialState(42, defaultSettings);
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
    expect(s.level).toBe(1);
    const flat = s.grid.flat();
    expect(flat.every((c) => c === null)).toBe(true);
  });

  it("next disc is between 1 and 7", () => {
    const s = initialState(42, defaultSettings);
    expect(s.next).toBeGreaterThanOrEqual(1);
    expect(s.next).toBeLessThanOrEqual(7);
  });
});

describe("discCountInRow / discCountInCol", () => {
  it("counts only numbered discs, not blanks", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[3]![0] = { value: 2 };
    grid[3]![1] = "blank";
    grid[3]![2] = { value: 5 };
    expect(discCountInRow(grid, 3)).toBe(2);
  });

  it("counts discs in a column", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[4]![1] = { value: 3 };
    grid[5]![1] = { value: 3 };
    grid[6]![1] = { value: 3 };
    expect(discCountInCol(grid, 1)).toBe(3);
  });
});

describe("findClears", () => {
  it("clears a disc whose value matches row count", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    // Put 2 discs in row 6 → a disc with value 2 should clear
    grid[6]![0] = { value: 2 };
    grid[6]![1] = { value: 4 };
    const clears = findClears(grid);
    expect(clears.has("6,0")).toBe(true);
    expect(clears.has("6,1")).toBe(false);
  });

  it("clears a disc whose value matches column count", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[4]![3] = { value: 1 }; // only 1 disc in col 3
    const clears = findClears(grid);
    expect(clears.has("4,3")).toBe(true);
  });
});

describe("applyGravity", () => {
  it("discs fall to lowest empty position", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = { value: 3 };
    const result = applyGravity(grid);
    expect(result[ROWS - 1]![0]).toEqual({ value: 3 });
    expect(result[0]![0]).toBeNull();
  });
});

describe("addBlankRow", () => {
  it("adds a row of blanks at bottom and shifts up", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[ROWS - 1]![0] = { value: 5 };
    const result = addBlankRow(grid);
    // Bottom row is now all blanks
    expect(result[ROWS - 1]!.every((c) => c === "blank")).toBe(true);
    // The disc moved up one row
    expect(result[ROWS - 2]![0]).toEqual({ value: 5 });
  });
});

describe("reducer - drop", () => {
  it("places disc at bottom of chosen column", () => {
    const s = initialState(42, defaultSettings);
    const discVal = s.next;
    const s2 = reducer(s, { type: "drop", col: 3 });
    expect(s2.grid[ROWS - 1]![3]).toEqual({ value: discVal });
  });

  it("stacks discs in same column", () => {
    let s = initialState(42, defaultSettings);
    // Drop many discs in col 0
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "drop", col: 0 });
    }
    // Col 0 should have multiple discs
    const colFilled = Array.from({ length: ROWS }, (_, r) => s.grid[r]![0]).filter((c) => c !== null);
    expect(colFilled.length).toBeGreaterThanOrEqual(1);
  });

  it("game over when discs reach top", () => {
    let s = initialState(42, defaultSettings);
    let iters = 0;
    while (!s.over && iters < 500) {
      // Drop in col 0 until full, then col 1, etc.
      let dropped = false;
      for (let c = 0; c < COLS; c++) {
        if (s.grid[0]![c] === null) {
          s = reducer(s, { type: "drop", col: c });
          dropped = true;
          break;
        }
      }
      if (!dropped) break;
      iters++;
    }
    expect(s.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null when game ongoing", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when over", () => {
    const s: Drop7State = { ...initialState(42, defaultSettings), over: true, score: 42 };
    expect(isTerminal(s)).toEqual({ score: 42 });
  });
});
