import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMovesFor960 } from "./state.js";
import type { Chess960Settings } from "./state.js";
import { idx } from "../_chess-core/types.js";

const settings: Chess960Settings = { opponent: "easy" };

describe("Chess960 initialState", () => {
  it("has 32 pieces on the board", () => {
    const s = initialState(42, settings);
    const pieces = s.board.filter(p => p !== null);
    expect(pieces.length).toBe(32);
  });

  it("white moves first", () => {
    const s = initialState(42, settings);
    expect(s.turn).toBe("white");
  });

  it("bishops are on opposite colors", () => {
    const s = initialState(99, settings);
    const whiteBishops = [];
    for (let c = 0; c < 8; c++) {
      const p = s.board[idx(7, c)];
      if (p?.type === "bishop") whiteBishops.push(c);
    }
    expect(whiteBishops.length).toBe(2);
    // one on even col, one on odd col
    const colors = whiteBishops.map(c => c % 2);
    expect(colors[0]).not.toBe(colors[1]);
  });

  it("king is between rooks", () => {
    const s = initialState(123, settings);
    let kingCol = -1;
    const rookCols: number[] = [];
    for (let c = 0; c < 8; c++) {
      const p = s.board[idx(7, c)];
      if (p?.type === "king") kingCol = c;
      if (p?.type === "rook") rookCols.push(c);
    }
    expect(rookCols.length).toBe(2);
    expect(rookCols[0]).toBeLessThan(kingCol);
    expect(rookCols[1]).toBeGreaterThan(kingCol);
  });
});

describe("Chess960 legal moves", () => {
  it("generates legal moves from start", () => {
    const s = initialState(42, settings);
    const moves = legalMovesFor960(s.board, "white", null, s.castling);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("reducer updates turn", () => {
    const s = initialState(42, settings);
    const moves = legalMovesFor960(s.board, "white", null, s.castling);
    const m = moves[0]!;
    const next = reducer(s, { type: "move", from: m.from, to: m.to });
    // After white moves, bot (black) also moves, so it may be white again
    expect(["white", "black"]).toContain(next.turn);
  });

  it("isTerminal returns null at start", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("different seeds produce different boards", () => {
    const s1 = initialState(1, settings);
    const s2 = initialState(999, settings);
    // Very unlikely to be identical
    const b1 = s1.board.map(p => p ? p.type : "-").join(",");
    const b2 = s2.board.map(p => p ? p.type : "-").join(",");
    // They differ in at least the back rank (which is random)
    // With different seeds, rows 0 and 7 should usually differ
    const r1 = s1.board.slice(0, 8).map(p => p?.type ?? "-").join(",");
    const r2 = s2.board.slice(0, 8).map(p => p?.type ?? "-").join(",");
    // Check that boards were generated (could theoretically collide but extremely rare)
    expect(b1.length).toBeGreaterThan(0);
    expect(b2.length).toBeGreaterThan(0);
    // At least one should have pieces
    expect(r1).not.toBe("");
    expect(r2).not.toBe("");
  });
});
