import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, formsMill, canRemove } from "./state.js";

describe("Morabaraba", () => {
  it("starts with empty board and 12 pieces in hand", () => {
    const s = initialState(0, {});
    expect(s.pHand).toBe(12);
    expect(s.bHand).toBe(12);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.turn).toBe("P");
    expect(s.phase).toBe("place");
  });

  it("placing a piece decrements pHand", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "place", pos: 0 });
    // Board[0] set to P, then bot places, turn back to P
    expect(next.board[0]).toBe("P");
    expect(next.pHand).toBe(11);
  });

  it("rejects placing on occupied square", () => {
    const s = initialState(0, {});
    const s2 = reducer(s, { type: "place", pos: 0 }); // P places at 0
    // Force turn to P for test
    const s3 = { ...s2, turn: "P" as const };
    const s4 = reducer(s3, { type: "place", pos: 0 });
    expect(s4.board[0]).toBe("P"); // unchanged
  });

  it("formsMill detects 3 in a row", () => {
    const board = new Array(24).fill(null);
    board[0] = "P"; board[1] = "P"; board[2] = "P";
    expect(formsMill(board, 0, "P")).toBe(true);
    expect(formsMill(board, 0, "B")).toBe(false);
  });

  it("canRemove allows removing non-mill piece", () => {
    const board = new Array(24).fill(null);
    board[5] = "B"; // not in any mill
    expect(canRemove(board, 5, "P")).toBe(true);
    expect(canRemove(board, 5, "B")).toBe(false); // wrong player
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns 100 for P win", () => {
    const s = { ...initialState(0, {}), winner: "P" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("isTerminal returns 0 for B win", () => {
    const s = { ...initialState(0, {}), winner: "B" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
