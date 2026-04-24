import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";
import type { ArmenianDraughtsSettings, ArmenianDraughtsState } from "./state.js";

const settings: ArmenianDraughtsSettings = { opponent: "bot" };

describe("ArmenianDraughts initialState", () => {
  it("places 16 white and 16 black pieces", () => {
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
});

describe("ArmenianDraughts legalMoves", () => {
  it("has legal moves at start", () => {
    const s = initialState(1, settings);
    const moves = getLegalMoves(s.board, "white", null);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("white men move forward or sideways (not backward) at start", () => {
    const s = initialState(1, settings);
    const moves = getLegalMoves(s.board, "white", null);
    for (const m of moves) {
      const fromRow = Math.floor(m.from / 8);
      const toRow = Math.floor(m.to / 8);
      expect(toRow).toBeLessThanOrEqual(fromRow);
    }
  });
});

describe("ArmenianDraughts reducer", () => {
  it("ignores actions when game is over", () => {
    const s: ArmenianDraughtsState = { ...initialState(1, settings), winner: "white" };
    const s2 = reducer(s, { type: "select", pos: 40 });
    expect(s2).toBe(s);
  });

  it("selects a white piece", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", pos: 40 });
    expect(s2.selected).toBe(40);
  });

  it("does not select a black piece", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", pos: 8 });
    expect(s2.selected).toBeNull();
  });
});

describe("ArmenianDraughts isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 20 on white win", () => {
    const s: ArmenianDraughtsState = { ...initialState(1, settings), winner: "white" };
    expect(isTerminal(s)?.score).toBe(20);
  });

  it("returns score 0 on black win", () => {
    const s: ArmenianDraughtsState = { ...initialState(1, settings), winner: "black" };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
