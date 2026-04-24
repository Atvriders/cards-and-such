import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves, SIZE } from "./state.js";
import type { FiveFieldKonoSettings, FiveFieldKonoState } from "./state.js";

const settings: FiveFieldKonoSettings = { opponent: "bot" };

describe("FiveFieldKono initialState", () => {
  it("places 10 white and 10 black pieces", () => {
    const s = initialState(1, settings);
    const white = s.board.filter((c) => c === "white").length;
    const black = s.board.filter((c) => c === "black").length;
    expect(white).toBe(10);
    expect(black).toBe(10);
  });

  it("starts white's turn with no winner", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("white");
    expect(s.winner).toBeNull();
  });

  it("middle row is empty at start", () => {
    const s = initialState(1, settings);
    for (let c = 0; c < SIZE; c++) {
      expect(s.board[2 * SIZE + c]).toBeNull();
    }
  });
});

describe("FiveFieldKono legalMoves", () => {
  it("white has legal moves at start", () => {
    const s = initialState(1, settings);
    const moves = getLegalMoves(s.board, "white");
    expect(moves.length).toBeGreaterThan(0);
  });

  it("all initial moves are non-capturing (no adjacency)", () => {
    const s = initialState(1, settings);
    const moves = getLegalMoves(s.board, "white");
    for (const m of moves) {
      expect(m.isCapture).toBe(false);
    }
  });
});

describe("FiveFieldKono reducer", () => {
  it("ignores actions when game is over", () => {
    const s: FiveFieldKonoState = { ...initialState(1, settings), winner: "white" };
    const s2 = reducer(s, { type: "select", pos: 15 });
    expect(s2).toBe(s);
  });

  it("selects a white piece", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", pos: 15 }); // row 3, col 0
    expect(s2.selected).toBe(15);
  });

  it("does not select a black piece", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", pos: 0 }); // row 0, col 0
    expect(s2.selected).toBeNull();
  });
});

describe("FiveFieldKono isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 20 on white win", () => {
    const s: FiveFieldKonoState = { ...initialState(1, settings), winner: "white" };
    expect(isTerminal(s)?.score).toBe(20);
  });

  it("returns score 0 on black win", () => {
    const s: FiveFieldKonoState = { ...initialState(1, settings), winner: "black" };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
