import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Go9x9State } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

const settings = { opponent: "hot-seat" as const };

describe("Go9x9 initialState", () => {
  it("starts with empty 9x9 board", () => {
    const s = initialState(1, settings);
    expect(s.grid.rows).toBe(9);
    expect(s.grid.cols).toBe(9);
    for (const c of s.grid.coords()) {
      expect(s.grid.get(c)).toBeNull();
    }
  });

  it("black moves first", () => {
    expect(initialState(1, settings).turn).toBe("B");
  });

  it("starts with zero captures and passes", () => {
    const s = initialState(1, settings);
    expect(s.capturedB).toBe(0);
    expect(s.capturedW).toBe(0);
    expect(s.consecutivePasses).toBe(0);
  });
});

describe("Go9x9 placement", () => {
  it("places stone on empty cell", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "place", at: { row: 4, col: 4 } });
    expect(next.grid.get({ row: 4, col: 4 })).toBe("B");
    expect(next.turn).toBe("W");
  });

  it("cannot place on occupied cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", at: { row: 4, col: 4 } });
    // Now it's white's turn; try to place on same spot
    const s3 = reducer(s2, { type: "place", at: { row: 4, col: 4 } });
    expect(s3.grid.get({ row: 4, col: 4 })).toBe("B"); // unchanged
  });

  it("capture surrounded group", () => {
    // Surround a single B stone with W stones and capture it
    const cells: Cell[] = new Array(81).fill(null);
    cells[4 * 9 + 4] = "B";
    cells[3 * 9 + 4] = "W";
    cells[5 * 9 + 4] = "W";
    cells[4 * 9 + 3] = "W";
    // One liberty left at (4,5); W places there
    const state: Go9x9State = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(9, 9, cells),
      turn: "W",
      consecutivePasses: 0,
      capturedB: 0,
      capturedW: 0,
      winner: null,
      scores: null,
    };
    const next = reducer(state, { type: "place", at: { row: 4, col: 5 } });
    expect(next.grid.get({ row: 4, col: 4 })).toBeNull(); // captured
    expect(next.capturedB).toBe(1);
  });
});

describe("Go9x9 pass and game end", () => {
  it("two passes end the game", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "pass" });
    expect(s2.consecutivePasses).toBe(1);
    expect(s2.winner).toBeNull();
    const s3 = reducer(s2, { type: "pass" });
    expect(s3.winner).not.toBeNull();
  });

  it("isTerminal returns score after two passes", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "pass" });
    const s3 = reducer(s2, { type: "pass" });
    const term = isTerminal(s3);
    expect(term).not.toBeNull();
  });
});
