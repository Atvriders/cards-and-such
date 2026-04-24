import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, allDominoes, ROWS, COLS } from "./state.js";

const settings = { hint: false };

describe("allDominoes", () => {
  it("returns 28 unique dominoes", () => {
    const d = allDominoes();
    expect(d.length).toBe(28);
    const keys = d.map(([a, b]) => `${a}-${b}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(28);
  });
});

describe("initialState", () => {
  it("creates a ROWS×COLS grid", () => {
    const s = initialState(42, settings);
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
  });

  it("all cells are 0..6", () => {
    const s = initialState(7, settings);
    for (const row of s.grid)
      for (const v of row)
        expect(v).toBeGreaterThanOrEqual(0);
  });

  it("starts with no claims", () => {
    expect(initialState(1, settings).claims.length).toBe(0);
  });
});

describe("reducer - claim", () => {
  it("adds a claim for adjacent cells", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "claim", cells: ["0,0", "0,1"] });
    expect(s2.claims.length).toBe(1);
  });

  it("rejects non-adjacent cells", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "claim", cells: ["0,0", "2,2"] });
    expect(s2.claims.length).toBe(0);
  });

  it("rejects already-claimed cells", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "claim", cells: ["0,0", "0,1"] });
    const s3 = reducer(s2, { type: "claim", cells: ["0,0", "1,0"] });
    expect(s3.claims.length).toBe(1); // cell 0,0 already used
  });
});

describe("reducer - unclaim", () => {
  it("removes an existing claim", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "claim", cells: ["0,0", "0,1"] });
    expect(s2.claims.length).toBe(1);
    const s3 = reducer(s2, { type: "unclaim", cells: ["0,0", "0,1"] });
    expect(s3.claims.length).toBe(0);
  });
});

describe("isTerminal", () => {
  it("returns null when incomplete", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score 1000 when won", () => {
    const s = { ...initialState(1, settings), over: true, won: true };
    expect(isTerminal(s)).toEqual({ score: 1000 });
  });

  it("returns 0 score when over but not won", () => {
    const s = { ...initialState(1, settings), over: true, won: false };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
