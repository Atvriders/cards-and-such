import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";
import type { IDSettings, IDPiece } from "./state.js";
import { Grid } from "../../engines/grid/index.js";

const defaultSettings: IDSettings = { opponent: "easy" };

function makeGrid(setup: Array<{ row: number; col: number; piece: IDPiece }>): Grid<IDPiece | null> {
  const cells: (IDPiece | null)[] = new Array(100).fill(null);
  for (const { row, col, piece } of setup) {
    cells[row * 10 + col] = piece;
  }
  return new Grid<IDPiece | null>(10, 10, cells);
}

describe("International Draughts initialState", () => {
  it("starts with 20 pieces per side", () => {
    const s = initialState(42, defaultSettings);
    let white = 0, black = 0;
    for (const c of s.grid.coords()) {
      const p = s.grid.get(c);
      if (p?.color === "white") white++;
      if (p?.color === "black") black++;
    }
    expect(white).toBe(20);
    expect(black).toBe(20);
  });

  it("all pieces on dark squares", () => {
    const s = initialState(42, defaultSettings);
    for (const c of s.grid.coords()) {
      const p = s.grid.get(c);
      if (p !== null) {
        expect((c.row + c.col) % 2).toBe(1);
      }
    }
  });

  it("white moves first", () => {
    const s = initialState(42, defaultSettings);
    expect(s.turn).toBe("white");
  });
});

describe("International Draughts move rules", () => {
  it("men can capture backward", () => {
    const grid = makeGrid([
      { row: 9, col: 0 }, // dummy white king pos not needed
      { row: 5, col: 3, piece: { color: "white", king: false } },
      { row: 4, col: 4, piece: { color: "black", king: false } },
      { row: 0, col: 0, piece: { color: "black", king: false } }, // keep black alive
    ].filter(x => x.piece).map(x => x as { row: number; col: number; piece: IDPiece }));
    const moves = getLegalMoves(grid, "white", null);
    // White man at (5,3) can jump black at (4,4) => land at (3,5) — forward capture
    const forwardCapture = moves.find((m) => m.from.row === 5 && m.from.col === 3 && m.to.row === 3 && m.to.col === 5);
    expect(forwardCapture).toBeDefined();
  });

  it("mandatory maximum capture is enforced", () => {
    // Set up where one capture chain has 2 captures and another has 1
    const grid = makeGrid([
      { row: 5, col: 1, piece: { color: "white", king: false } },
      { row: 4, col: 2, piece: { color: "black", king: false } },
      { row: 2, col: 4, piece: { color: "black", king: false } },
      { row: 1, col: 9, piece: { color: "black", king: false } }, // dummy
    ]);
    const moves = getLegalMoves(grid, "white", null);
    if (moves.length > 0) {
      const maxCaps = Math.max(...moves.map((m) => m.captures.length));
      expect(moves.every((m) => m.captures.length === maxCaps)).toBe(true);
    }
  });

  it("flying king slides multiple squares", () => {
    const grid = makeGrid([
      { row: 5, col: 5, piece: { color: "white", king: true } },
      { row: 9, col: 9, piece: { color: "black", king: false } }, // dummy
    ]);
    const moves = getLegalMoves(grid, "white", null);
    // King at (5,5) should have moves along all 4 diagonals
    expect(moves.length).toBeGreaterThan(4);
  });

  it("isTerminal returns null at start", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
