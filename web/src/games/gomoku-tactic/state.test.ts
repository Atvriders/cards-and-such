import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { GomokuTacticState } from "./state.js";

describe("GomokuTactic initialState", () => {
  it("starts with empty 9x9 board", () => {
    const s = initialState(42);
    expect(s.board).toHaveLength(81);
    expect(s.board.every((v) => v === null)).toBe(true);
    expect(s.currentPlayer).toBe("B");
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("GomokuTactic place", () => {
  it("places a black stone and triggers AI response", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "place", index: 40 }); // center
    expect(s2.board[40]).toBe("B");
    // AI should have placed a white stone somewhere
    expect(s2.board.filter((v) => v === "W")).toHaveLength(1);
  });

  it("ignores placing on occupied cell", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "place", index: 40 });
    const s3 = reducer(s2, { type: "place", index: 40 });
    expect(s3.board.filter((v) => v === "B")).toHaveLength(1);
  });

  it("is deterministic with same seed", () => {
    const s = initialState(5);
    const a = reducer(s, { type: "place", index: 30 });
    const b = reducer(s, { type: "place", index: 30 });
    expect(a.board).toEqual(b.board);
  });
});

describe("GomokuTactic win detection", () => {
  it("detects 5 in a row win for Black", () => {
    const board = Array(81).fill(null);
    board[0] = "B"; board[1] = "B"; board[2] = "B"; board[3] = "B";
    const s: GomokuTacticState = {
      ...initialState(1),
      board,
      currentPlayer: "B",
    };
    const s2 = reducer(s, { type: "place", index: 4 });
    expect(s2.winner).toBe("B");
    expect(s2.gameOver).toBe(true);
  });
});

describe("GomokuTactic isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns 1000 for Black win", () => {
    const s: GomokuTacticState = { ...initialState(1), gameOver: true, winner: "B" };
    expect(isTerminal(s)!.score).toBe(1000);
  });

  it("returns 0 for White win", () => {
    const s: GomokuTacticState = { ...initialState(1), gameOver: true, winner: "W" };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
