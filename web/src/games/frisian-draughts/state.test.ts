import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";

describe("Frisian Draughts", () => {
  it("starts with 20 pieces per side", () => {
    const s = initialState(0, {});
    let w = 0, b = 0;
    for (const row of s.board) for (const cell of row) {
      if (cell?.color === "W") w++;
      if (cell?.color === "B") b++;
    }
    expect(w).toBe(20);
    expect(b).toBe(20);
    expect(s.turn).toBe("W");
  });

  it("only dark squares occupied at start", () => {
    const s = initialState(0, {});
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      if ((r + c) % 2 === 0) expect(s.board[r]![c]).toBeNull();
    }
  });

  it("legal moves exist at start (diagonal forward)", () => {
    const s = initialState(0, {});
    const moves = getLegalMoves(s.board, "W", null);
    expect(moves.length).toBeGreaterThan(0);
    // All initial moves are simple (no captures)
    expect(moves.every(m => m.captures.length === 0)).toBe(true);
  });

  it("isTerminal null mid-game", () => {
    expect(isTerminal(initialState(0, {}))).toBeNull();
  });

  it("isTerminal returns score for W win", () => {
    const s = { ...initialState(0, {}), winner: "W" as const };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("isTerminal returns 0 for B win", () => {
    const s = { ...initialState(0, {}), winner: "B" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("rejects click when not player turn", () => {
    const s = { ...initialState(0, {}), turn: "B" as const };
    const next = reducer(s, { type: "click", row: 6, col: 1 });
    expect(next).toBe(s);
  });
});
