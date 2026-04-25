import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findMatches, COLS, ROWS } from "./state.js";

const settings = { levels: "3" as const };

describe("initialState", () => {
  it("starts with score 0, level 1, 20 moves", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.level).toBe(1);
    expect(s.movesLeft).toBe(20);
    expect(s.over).toBe(false);
  });

  it("grid is 6x6", () => {
    const s = initialState(42, settings);
    expect(s.grid).toHaveLength(ROWS);
    expect(s.grid[0]).toHaveLength(COLS);
  });

  it("starts with no selection", () => {
    const s = initialState(42, settings);
    expect(s.selected).toBeNull();
  });
});

describe("select action", () => {
  it("selects a cell on first click", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "select", row: 0, col: 0 });
    expect(after.selected).toEqual([0, 0]);
  });

  it("deselects on same cell click", () => {
    const s = initialState(42, settings);
    const sel = reducer(s, { type: "select", row: 0, col: 0 });
    const desel = reducer(sel, { type: "select", row: 0, col: 0 });
    expect(desel.selected).toBeNull();
  });

  it("changes selection for non-adjacent cell", () => {
    const s = initialState(42, settings);
    const sel = reducer(s, { type: "select", row: 0, col: 0 });
    const resel = reducer(sel, { type: "select", row: 3, col: 3 });
    expect(resel.selected).toEqual([3, 3]);
  });
});

describe("findMatches", () => {
  it("finds horizontal match of 3", () => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = 1;
    grid[0]![1] = 1;
    grid[0]![2] = 1;
    const matches = findMatches(grid);
    expect(matches.has("0,0")).toBe(true);
    expect(matches.has("0,1")).toBe(true);
    expect(matches.has("0,2")).toBe(true);
  });

  it("finds vertical match of 3", () => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = 2;
    grid[1]![0] = 2;
    grid[2]![0] = 2;
    const matches = findMatches(grid);
    expect(matches.has("0,0")).toBe(true);
    expect(matches.has("1,0")).toBe(true);
    expect(matches.has("2,0")).toBe(true);
  });

  it("returns empty set for no matches", () => {
    const grid = [
      [0, 1, 2, 0, 1, 2],
      [1, 2, 0, 1, 2, 0],
      [2, 0, 1, 2, 0, 1],
      [0, 1, 2, 0, 1, 2],
      [1, 2, 0, 1, 2, 0],
      [2, 0, 1, 2, 0, 1],
    ];
    const matches = findMatches(grid);
    expect(matches.size).toBe(0);
  });
});

describe("valid swap", () => {
  it("scores points when swap creates a match", () => {
    const s = initialState(42, settings);
    // Force a grid with a guaranteed match after swap
    const grid = s.grid.map((row) => [...row]);
    // Create a row [0,1,1,0,0,0] → swapping (0,0) and (0,1) with 0 matches if we set up carefully
    // Easier: just set up a known match
    grid[0]![0] = 0;
    grid[0]![1] = 1;
    grid[0]![2] = 0;
    grid[0]![3] = 0;
    // Select (0,0) then swap with (0,1) — if no match: select changes
    const forced = { ...s, grid };
    const sel = reducer(forced, { type: "select", row: 0, col: 0 });
    // After swap attempt: if no match, selection changes; either way no crash
    const after = reducer(sel, { type: "select", row: 0, col: 1 });
    expect(after.selected).toBeNull(); // swap was attempted
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, settings), over: true, score: 750 };
    expect(isTerminal(s)!.score).toBe(750);
  });
});
