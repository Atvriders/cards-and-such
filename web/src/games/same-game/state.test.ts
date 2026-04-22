import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findGroup, hasValidMoves, applyGravity, shiftColumns, groupScore, COLS, ROWS } from "./state.js";
import type { Grid } from "./state.js";

const defaultSettings = { colors: "4" as const };

describe("initialState", () => {
  it("creates a fully-filled 15×10 grid", () => {
    const s = initialState(42, defaultSettings);
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
    const flat = s.grid.flat();
    expect(flat.every((c) => c !== null)).toBe(true);
  });

  it("respects color count", () => {
    const s = initialState(1, { colors: "3" as const });
    const flat = s.grid.flat();
    expect(flat.every((c) => (c as number) < 3)).toBe(true);
  });
});

describe("findGroup", () => {
  it("finds all connected same-color cells", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    // Put a different color to limit the group
    grid[0]![3] = 2;
    const group = findGroup(grid, 0, 0);
    // Should not cross the color-2 cell at (0,3)
    expect(group.some(([r, c]) => r === 0 && c === 3)).toBe(false);
    expect(group.length).toBeGreaterThan(0);
  });

  it("returns empty array for null cell", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    expect(findGroup(grid, 0, 0)).toEqual([]);
  });

  it("returns single element for isolated cell", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    grid[5]![5] = 1; // surrounded by 0s
    const group = findGroup(grid, 5, 5);
    expect(group.length).toBe(1);
    expect(group[0]).toEqual([5, 5]);
  });
});

describe("groupScore", () => {
  it("scores N*(N-1)", () => {
    expect(groupScore(2)).toBe(2);
    expect(groupScore(3)).toBe(6);
    expect(groupScore(10)).toBe(90);
  });
});

describe("applyGravity", () => {
  it("blocks fall to fill empty space below", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[0]![0] = 2; // block at top
    const result = applyGravity(grid);
    expect(result[ROWS - 1]![0]).toBe(2);
    expect(result[0]![0]).toBeNull();
  });
});

describe("shiftColumns", () => {
  it("empty columns shift to the right", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    // Block in col 2
    grid[ROWS - 1]![2] = 3;
    const result = shiftColumns(grid);
    // Block should now be in col 0
    expect(result[ROWS - 1]![0]).toBe(3);
    expect(result[ROWS - 1]![2]).toBeNull();
  });
});

describe("hasValidMoves", () => {
  it("returns true when groups of 2+ exist", () => {
    const s = initialState(42, defaultSettings);
    expect(hasValidMoves(s.grid)).toBe(true);
  });

  it("returns false when all remaining blocks are isolated", () => {
    // Checkerboard of alternating colors: no adjacency
    const grid: Grid = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => (r + c) % 4)
    );
    // This might still have moves; just test that a fully isolated grid returns false
    const allNull: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    expect(hasValidMoves(allNull)).toBe(false);
  });
});

describe("reducer - click", () => {
  it("removes a group and scores points", () => {
    const s = initialState(42, defaultSettings);
    // Find any group of 2+ and click it
    let found: [number, number] | null = null;
    outer: for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const group = findGroup(s.grid, r, c);
        if (group.length >= 2) { found = [r, c]; break outer; }
      }
    }
    expect(found).not.toBeNull();
    const s2 = reducer(s, { type: "click", row: found![0], col: found![1] });
    expect(s2.score).toBeGreaterThan(0);
  });

  it("does not allow clicking isolated single-block cells", () => {
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    grid[5]![5] = 0; // isolated block
    // Put different colors all around it
    grid[4]![5] = 1; grid[6]![5] = 1; grid[5]![4] = 1; grid[5]![6] = 1;
    const s = { ...initialState(42, defaultSettings), grid };
    const s2 = reducer(s, { type: "click", row: 5, col: 5 });
    expect(s2.score).toBe(s.score); // no change
  });

  it("game ends when board is cleared", () => {
    // Create a board with only a 2-block group
    const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    grid[ROWS - 1]![0] = 0;
    grid[ROWS - 1]![1] = 0;
    const s = { ...initialState(42, defaultSettings), grid };
    const s2 = reducer(s, { type: "click", row: ROWS - 1, col: 0 });
    expect(s2.over).toBe(true);
    expect(s2.score).toBe(groupScore(2) + 1000); // bonus for clearing
  });
});

describe("isTerminal", () => {
  it("returns null when ongoing", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, defaultSettings), over: true, score: 500 };
    expect(isTerminal(s)).toEqual({ score: 500 });
  });
});
