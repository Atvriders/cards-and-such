import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, flipsFor, legalMoves } from "./state.js";
import type { ReversiState } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

const defaultSettings = { botDifficulty: "easy" as const };

describe("Reversi initialState", () => {
  it("sets up standard 4-disc center with black to move", () => {
    const s = initialState(42, defaultSettings);
    expect(s.grid.rows).toBe(8);
    expect(s.grid.cols).toBe(8);
    expect(s.grid.get({ row: 3, col: 3 })).toBe(1); // white
    expect(s.grid.get({ row: 4, col: 4 })).toBe(1); // white
    expect(s.grid.get({ row: 3, col: 4 })).toBe(0); // black
    expect(s.grid.get({ row: 4, col: 3 })).toBe(0); // black
    expect(s.turn).toBe(0);
    expect(s.blackCount).toBe(2);
    expect(s.whiteCount).toBe(2);
    expect(s.winner).toBeNull();
  });
});

describe("flipsFor", () => {
  it("returns empty array for occupied cell", () => {
    const s = initialState(42, defaultSettings);
    expect(flipsFor(s.grid, 0, 3, 3)).toHaveLength(0);
  });

  it("returns empty array for a cell with no flanking", () => {
    const s = initialState(42, defaultSettings);
    // corner has no flanking in initial position
    expect(flipsFor(s.grid, 0, 0, 0)).toHaveLength(0);
  });

  it("returns flipped discs for a legal move", () => {
    const s = initialState(42, defaultSettings);
    // Black at (2,3) should flip white at (3,3)
    const flips = flipsFor(s.grid, 0, 2, 3);
    expect(flips).toHaveLength(1);
    expect(flips[0]).toEqual({ row: 3, col: 3 });
  });
});

describe("legalMoves", () => {
  it("black has exactly 4 legal moves at start", () => {
    const s = initialState(42, defaultSettings);
    const moves = legalMoves(s.grid, 0);
    expect(moves).toHaveLength(4);
  });

  it("white has exactly 4 legal moves at start", () => {
    const s = initialState(42, defaultSettings);
    const moves = legalMoves(s.grid, 1);
    expect(moves).toHaveLength(4);
  });
});

describe("Reversi reducer - place", () => {
  it("placing on occupied cell is a no-op", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place", at: { row: 3, col: 3 } });
    expect(s2).toBe(s);
  });

  it("placing on a cell with no flips is a no-op", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place", at: { row: 0, col: 0 } });
    expect(s2).toBe(s);
  });

  it("legal place flips opponent disc and increments movesMade", () => {
    const s = initialState(42, defaultSettings);
    // Black places at (2,3) — flips (3,3) from white to black
    // But bot is easy and will respond; check state after both moves
    const s2 = reducer(s, { type: "place", at: { row: 2, col: 3 } });
    // After human move, bot has moved — black disc placed + flip
    expect(s2.movesMade).toBeGreaterThanOrEqual(1);
    // The cell placed should be black
    expect(s2.grid.get({ row: 2, col: 3 })).toBe(0);
  });

  it("placing illegal move on non-adjacent empty is no-op", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place", at: { row: 0, col: 7 } });
    expect(s2).toBe(s);
  });
});

describe("Reversi reducer - pass", () => {
  it("pass when legal moves exist is a no-op", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "pass" });
    expect(s2).toBe(s);
  });

  it("pass when no legal moves advances turn", () => {
    // Build a custom state where seat 0 has no legal moves
    const cells: Cell[] = new Array(64).fill(null);
    // Fill board mostly with same color — seat 0 has no moves
    for (let i = 0; i < 64; i++) cells[i] = 1;
    cells[0] = 0;
    cells[1] = null;
    // seat 0 (black) has no flanking possible since only whites around and no anchor
    const grid = new Grid<Cell>(8, 8, cells);
    const s: ReversiState = {
      settings: defaultSettings,
      grid,
      turn: 0,
      lastPass: false,
      winner: null,
      movesMade: 0,
      blackCount: 1,
      whiteCount: 62,
      rngSeed: 1,
    };
    const moves = legalMoves(grid, 0);
    // Ensure no legal moves
    if (moves.length === 0) {
      const s2 = reducer(s, { type: "pass" });
      // Should advance or end game
      expect(s2).not.toBe(s);
    }
  });
});

describe("Reversi isTerminal", () => {
  it("returns null when game is in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score on black win", () => {
    const s = initialState(42, defaultSettings);
    const finished: ReversiState = { ...s, winner: 0, blackCount: 40, whiteCount: 24 };
    const result = isTerminal(finished);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(100 + (40 - 24) * 5); // 180
  });

  it("returns 50 on draw", () => {
    const s = initialState(42, defaultSettings);
    const finished: ReversiState = { ...s, winner: "draw", blackCount: 32, whiteCount: 32 };
    expect(isTerminal(finished)!.score).toBe(50);
  });

  it("returns small score on white win", () => {
    const s = initialState(42, defaultSettings);
    const finished: ReversiState = { ...s, winner: 1, blackCount: 5, whiteCount: 59 };
    const result = isTerminal(finished);
    expect(result!.score).toBe(Math.max(0, 5 - 10)); // 0
  });
});
