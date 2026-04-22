import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AtariGoState } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

const settings = { opponent: "hot-seat" as const };

describe("AtariGo initialState", () => {
  it("starts with empty 9x9 board", () => {
    const s = initialState(1, settings);
    expect(s.grid.rows).toBe(9);
    for (const c of s.grid.coords()) expect(s.grid.get(c)).toBeNull();
  });

  it("black moves first", () => {
    expect(initialState(1, settings).turn).toBe("B");
  });
});

describe("AtariGo placement", () => {
  it("places stone and changes turn", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "place", at: { row: 0, col: 0 } });
    expect(next.grid.get({ row: 0, col: 0 })).toBe("B");
    expect(next.turn).toBe("W");
  });

  it("capture ends the game (first capture wins)", () => {
    // W stones surrounding a B stone, last W placed completes capture
    const cells: Cell[] = new Array(81).fill(null);
    cells[4 * 9 + 4] = "B"; // lone B
    cells[3 * 9 + 4] = "W";
    cells[5 * 9 + 4] = "W";
    cells[4 * 9 + 3] = "W";
    // W plays at (4,5) — captures B
    const state: AtariGoState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(9, 9, cells),
      turn: "W",
      capturedB: 0,
      capturedW: 0,
      winner: null,
    };
    const next = reducer(state, { type: "place", at: { row: 4, col: 5 } });
    expect(next.winner).toBe("W");
    expect(next.capturedB).toBe(1);
  });

  it("cannot place on occupied cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", at: { row: 4, col: 4 } });
    const before = s2.grid;
    const s3 = reducer(s2, { type: "place", at: { row: 4, col: 4 } });
    expect(s3.grid).toBe(before);
  });

  it("isTerminal returns score after capture", () => {
    const cells: Cell[] = new Array(81).fill(null);
    cells[0] = "B";
    const state: AtariGoState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(9, 9, cells),
      turn: "W",
      capturedB: 1,
      capturedW: 0,
      winner: "W",
    };
    const term = isTerminal(state);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(0); // bot wins = score 0
  });
});
