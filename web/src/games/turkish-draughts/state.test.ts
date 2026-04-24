import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";
import type { TurkishDraughtsSettings, TurkishDraughtsState } from "./state.js";

const settings: TurkishDraughtsSettings = { opponent: "bot" };

describe("TurkishDraughts initialState", () => {
  it("places 16 white and 16 black pieces on board", () => {
    const s = initialState(1, settings);
    const white = s.board.filter((p) => p?.color === "white").length;
    const black = s.board.filter((p) => p?.color === "black").length;
    expect(white).toBe(16);
    expect(black).toBe(16);
  });

  it("starts with white's turn and no winner", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("white");
    expect(s.winner).toBeNull();
  });

  it("white pieces on rows 5-6", () => {
    const s = initialState(1, settings);
    for (let r = 5; r <= 6; r++) {
      for (let c = 0; c < 8; c++) {
        expect(s.board[r * 8 + c]?.color).toBe("white");
      }
    }
  });
});

describe("TurkishDraughts legalMoves", () => {
  it("white has legal moves at start", () => {
    const s = initialState(1, settings);
    const moves = getLegalMoves(s.board, "white", null);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("moves go forward or sideways only (no backward)", () => {
    const s = initialState(1, settings);
    const moves = getLegalMoves(s.board, "white", null);
    for (const m of moves) {
      const fromRow = Math.floor(m.from / 8);
      const toRow = Math.floor(m.to / 8);
      // White moves forward = row decreases
      expect(toRow).toBeLessThanOrEqual(fromRow);
    }
  });
});

describe("TurkishDraughts reducer", () => {
  it("ignores actions when game is over", () => {
    const s: TurkishDraughtsState = { ...initialState(1, settings), winner: "white" };
    const s2 = reducer(s, { type: "select", pos: 40 });
    expect(s2).toBe(s);
  });

  it("selects a white piece", () => {
    const s = initialState(1, settings);
    // row 5, col 0 = pos 40
    const s2 = reducer(s, { type: "select", pos: 40 });
    expect(s2.selected).toBe(40);
  });
});

describe("TurkishDraughts isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 20 on white win", () => {
    const s: TurkishDraughtsState = { ...initialState(1, settings), winner: "white" };
    expect(isTerminal(s)?.score).toBe(20);
  });

  it("returns score 0 on black win", () => {
    const s: TurkishDraughtsState = { ...initialState(1, settings), winner: "black" };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
