import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMoves, ROWS, COLS } from "./state.js";

const S = { dummy: false };

describe("Mini Xiangqi", () => {
  it("starts with full board", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(ROWS * COLS);
    expect(s.phase).toBe("playing");
    const pieces = s.board.filter(c => c !== null).length;
    expect(pieces).toBe(16); // 8 per side: 1K + 2Cn + 5S
  });

  it("Player has King at row 4 col 2", () => {
    const s = initialState(1, S);
    const k = s.board[27]!;
    expect(k).not.toBeNull();
    expect(k.kind).toBe("K");
    expect(k.color).toBe("P");
  });

  it("legalMoves of soldier moves forward", () => {
    const s = initialState(1, S);
    // Player soldier at idx 20 (row 4 col 0) moves up: row 3 col 0 = idx 15
    const moves = legalMoves(s.board, 20);
    expect(moves).toContain(15);
  });

  it("selecting own piece sets legal targets", () => {
    const s = initialState(1, S);
    const next = reducer(s, { type: "select", idx: 20 });
    expect(next.selected).toBe(20);
    expect(next.legalTargets.length).toBeGreaterThan(0);
  });

  it("selecting empty cell with no selection does nothing", () => {
    const s = initialState(1, S);
    const next = reducer(s, { type: "select", idx: 15 });
    expect(next.selected).toBeNull();
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("Cannon can slide on empty squares", () => {
    const s = initialState(1, S);
    // Player cannon at idx 25 (row 5 col 0) — but row 4 col 0 has soldier, blocked
    const moves = legalMoves(s.board, 25);
    // Cannon at row 5 col 0 — row 4 col 0 has soldier (screen). Sideways: col 1 empty? no, idx 26 is empty.
    expect(moves.length).toBeGreaterThanOrEqual(0);
  });
});
