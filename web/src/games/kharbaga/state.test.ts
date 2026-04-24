import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";
import type { KharbagaSettings, KharbagaState } from "./state.js";

const settings: KharbagaSettings = { opponent: "bot" };

describe("Kharbaga initialState", () => {
  it("places 10 white and 10 black pieces", () => {
    const s = initialState(1, settings);
    const white = s.board.filter((c) => c === "white").length;
    const black = s.board.filter((c) => c === "black").length;
    expect(white).toBe(10);
    expect(black).toBe(10);
  });

  it("starts with white's turn and no winner", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("white");
    expect(s.winner).toBeNull();
  });

  it("empty middle row at start", () => {
    const s = initialState(1, settings);
    for (let c = 0; c < 5; c++) {
      expect(s.board[2 * 5 + c]).toBeNull();
    }
  });
});

describe("Kharbaga legalMoves", () => {
  it("white has legal moves at start", () => {
    const s = initialState(1, settings);
    const moves = getLegalMoves(s.board, "white", null);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("all start moves are simple (no captures possible at start)", () => {
    const s = initialState(1, settings);
    const moves = getLegalMoves(s.board, "white", null);
    for (const m of moves) {
      expect(m.captured.length).toBe(0);
    }
  });
});

describe("Kharbaga reducer", () => {
  it("ignores actions when game is over", () => {
    const s: KharbagaState = { ...initialState(1, settings), winner: "white" };
    const s2 = reducer(s, { type: "select", pos: 15 });
    expect(s2).toBe(s);
  });

  it("selects a white piece", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", pos: 15 }); // row 3, col 0
    expect(s2.selected).toBe(15);
  });
});

describe("Kharbaga isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 20 on white win", () => {
    const s: KharbagaState = { ...initialState(1, settings), winner: "white" };
    expect(isTerminal(s)?.score).toBe(20);
  });

  it("returns score 0 on black win", () => {
    const s: KharbagaState = { ...initialState(1, settings), winner: "black" };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
