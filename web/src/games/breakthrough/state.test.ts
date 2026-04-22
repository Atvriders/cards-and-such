import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getMoves } from "./state.js";
import type { BreakthroughState } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

const settings = { opponent: "hot-seat" as const };

describe("Breakthrough initialState", () => {
  it("places 16 white pieces in rows 6-7", () => {
    const s = initialState(1, settings);
    let count = 0;
    for (const c of s.grid.coords()) {
      if (s.grid.get(c) === "W") { count++; expect(c.row).toBeGreaterThanOrEqual(6); }
    }
    expect(count).toBe(16);
  });

  it("places 16 black pieces in rows 0-1", () => {
    const s = initialState(1, settings);
    let count = 0;
    for (const c of s.grid.coords()) {
      if (s.grid.get(c) === "B") { count++; expect(c.row).toBeLessThanOrEqual(1); }
    }
    expect(count).toBe(16);
  });

  it("white moves first", () => {
    expect(initialState(1, settings).turn).toBe("W");
  });
});

describe("Breakthrough getMoves", () => {
  it("white piece in open center has 3 moves forward", () => {
    const cells: Cell[] = new Array(64).fill(null);
    cells[4 * 8 + 4] = "W";
    const grid = new Grid<Cell>(8, 8, cells);
    const moves = getMoves(grid, "W");
    expect(moves.length).toBe(3); // up-left, up, up-right
  });

  it("white piece cannot move forward onto own piece", () => {
    const cells: Cell[] = new Array(64).fill(null);
    cells[4 * 8 + 4] = "W";
    cells[3 * 8 + 4] = "W"; // blocks straight forward
    const grid = new Grid<Cell>(8, 8, cells);
    const moves = getMoves(grid, "W");
    expect(moves.every(m => !(m.to.row === 3 && m.to.col === 4))).toBe(true);
  });
});

describe("Breakthrough reducer", () => {
  it("moving to row 0 wins for white", () => {
    const cells: Cell[] = new Array(64).fill(null);
    cells[1 * 8 + 4] = "W"; // one move from top
    cells[7 * 8 + 0] = "B"; // black far away
    const state: BreakthroughState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(8, 8, cells),
      turn: "W",
      selected: null,
      winner: null,
    };
    const next = reducer(state, { type: "move", from: { row: 1, col: 4 }, to: { row: 0, col: 4 } });
    expect(next.winner).toBe("W");
  });

  it("isTerminal returns score 100 for white win", () => {
    const cells: Cell[] = new Array(64).fill(null);
    cells[0 * 8 + 4] = "W";
    cells[7 * 8 + 0] = "B";
    const state: BreakthroughState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(8, 8, cells),
      turn: "B",
      selected: null,
      winner: "W",
    };
    const term = isTerminal(state);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(100);
  });

  it("white captures black diagonally", () => {
    const cells: Cell[] = new Array(64).fill(null);
    cells[4 * 8 + 4] = "W";
    cells[3 * 8 + 5] = "B"; // diagonal target
    const state: BreakthroughState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(8, 8, cells),
      turn: "W",
      selected: null,
      winner: null,
    };
    const next = reducer(state, { type: "move", from: { row: 4, col: 4 }, to: { row: 3, col: 5 } });
    expect(next.grid.get({ row: 3, col: 5 })).toBe("W");
    expect(next.grid.get({ row: 4, col: 4 })).toBeNull();
  });
});
