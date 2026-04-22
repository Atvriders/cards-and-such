import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getMoves } from "./state.js";
import type { ClobberState } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

const settings = { opponent: "hot-seat" as const };

describe("Clobber initialState", () => {
  it("fills all 64 cells with alternating pieces", () => {
    const s = initialState(1, settings);
    let w = 0, b = 0;
    for (const c of s.grid.coords()) {
      const v = s.grid.get(c);
      expect(v).not.toBeNull();
      if (v === "W") w++;
      if (v === "B") b++;
    }
    expect(w).toBe(32);
    expect(b).toBe(32);
  });

  it("checkerboard pattern: (r+c) even = White", () => {
    const s = initialState(1, settings);
    for (const c of s.grid.coords()) {
      const v = s.grid.get(c);
      if ((c.row + c.col) % 2 === 0) expect(v).toBe("W");
      else expect(v).toBe("B");
    }
  });

  it("white moves first", () => {
    expect(initialState(1, settings).turn).toBe("W");
  });
});

describe("Clobber getMoves", () => {
  it("piece can only move onto opponent", () => {
    const cells: Cell[] = new Array(64).fill(null);
    cells[3 * 8 + 3] = "W";
    cells[3 * 8 + 4] = "B"; // adjacent enemy
    cells[2 * 8 + 3] = "W"; // adjacent own — blocked
    const grid = new Grid<Cell>(8, 8, cells);
    const moves = getMoves(grid, "W");
    expect(moves.length).toBe(1);
    expect(moves[0]!.to).toEqual({ row: 3, col: 4 });
  });
});

describe("Clobber reducer", () => {
  it("clobber replaces enemy piece", () => {
    const cells: Cell[] = new Array(64).fill(null);
    cells[4 * 8 + 4] = "W";
    cells[4 * 8 + 5] = "B";
    const state: ClobberState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(8, 8, cells),
      turn: "W",
      selected: null,
      winner: null,
    };
    const next = reducer(state, { type: "move", from: { row: 4, col: 4 }, to: { row: 4, col: 5 } });
    expect(next.grid.get({ row: 4, col: 5 })).toBe("W");
    expect(next.grid.get({ row: 4, col: 4 })).toBeNull();
  });

  it("no legal moves means previous player wins", () => {
    // W has one piece surrounded by own pieces — can't clobber anything
    const cells: Cell[] = new Array(64).fill(null);
    cells[4 * 8 + 4] = "W";
    cells[3 * 8 + 4] = "W";
    cells[5 * 8 + 4] = "W";
    cells[4 * 8 + 3] = "W";
    cells[4 * 8 + 5] = "W";
    cells[0] = "B"; // B far away
    const state: ClobberState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(8, 8, cells),
      turn: "W",
      selected: null,
      winner: null,
    };
    const term = isTerminal(state);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(0); // W can't move, W loses
  });

  it("move changes turn", () => {
    const cells: Cell[] = new Array(64).fill(null);
    cells[4 * 8 + 4] = "W";
    cells[4 * 8 + 5] = "B";
    const state: ClobberState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(8, 8, cells),
      turn: "W",
      selected: null,
      winner: null,
    };
    const next = reducer(state, { type: "move", from: { row: 4, col: 4 }, to: { row: 4, col: 5 } });
    expect(next.turn).toBe("B");
  });
});
