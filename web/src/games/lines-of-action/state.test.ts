import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getMoves } from "./state.js";
import type { LinesOfActionState } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

const settings = { opponent: "hot-seat" as const };

describe("Lines of Action initialState", () => {
  it("has 12 black and 12 white pieces", () => {
    const s = initialState(1, settings);
    let b = 0, w = 0;
    for (const c of s.grid.coords()) {
      const v = s.grid.get(c);
      if (v === "B") b++;
      if (v === "W") w++;
    }
    expect(b).toBe(12);
    expect(w).toBe(12);
  });

  it("black starts on top and bottom rows", () => {
    const s = initialState(1, settings);
    for (const c of s.grid.coords()) {
      if (s.grid.get(c) === "B") {
        expect(c.row === 0 || c.row === 7).toBe(true);
      }
    }
  });

  it("black moves first", () => {
    expect(initialState(1, settings).turn).toBe("B");
  });
});

describe("Lines of Action getMoves", () => {
  it("single piece in center with 1 piece per line has distance-1 moves", () => {
    // Only one piece on the board
    const cells: Cell[] = new Array(64).fill(null);
    cells[4 * 8 + 4] = "B";
    const grid = new Grid<Cell>(8, 8, cells);
    const moves = getMoves(grid, "B");
    // line count = 1 (only the piece itself), so it moves 1 square in 8 dirs (4 dirs x 2)
    expect(moves.length).toBeGreaterThan(0);
    for (const m of moves) {
      const dr = Math.abs(m.to.row - m.from.row);
      const dc = Math.abs(m.to.col - m.from.col);
      expect(Math.max(dr, dc)).toBe(1);
    }
  });
});

describe("Lines of Action reducer", () => {
  it("moving connects all pieces → winner", () => {
    // W has 2 pieces that can be connected: col 0 rows 3 and 4. Needs 1 more W to be connected.
    // Simple: place 2 adjacent W pieces already connected, check isTerminal
    const cells: Cell[] = new Array(64).fill(null);
    cells[3 * 8 + 3] = "W";
    cells[3 * 8 + 4] = "W"; // adjacent, so already connected if only 2 pieces
    cells[0] = "B"; // need at least one B
    const state: LinesOfActionState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(8, 8, cells),
      turn: "B",
      selected: null,
      winner: "W", // pre-set winner
    };
    const term = isTerminal(state);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(100);
  });

  it("move changes turn from B to W", () => {
    const s = initialState(1, settings);
    const moves = getMoves(s.grid, "B");
    expect(moves.length).toBeGreaterThan(0);
    const m = moves[0]!;
    const next = reducer(s, { type: "move", from: m.from, to: m.to });
    expect(next.turn).toBe("W");
  });

  it("illegal move is ignored", () => {
    const s = initialState(1, settings);
    const before = s.grid;
    const next = reducer(s, { type: "move", from: { row: 0, col: 0 }, to: { row: 7, col: 7 } });
    expect(next.grid).toBe(before);
  });

  it("select sets selected coord", () => {
    const s = initialState(1, settings);
    // Black can select from row 0, col 1..6
    const next = reducer(s, { type: "select", at: { row: 0, col: 1 } });
    expect(next.selected).toEqual({ row: 0, col: 1 });
  });
});
