import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, countPieces, CENTER } from "./state.js";

describe("Seega", () => {
  it("starts with empty board and 12 each in hand", () => {
    const s = initialState(0, {});
    expect(s.pHand).toBe(12);
    expect(s.bHand).toBe(12);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.turn).toBe("P");
    expect(s.phase).toBe("place");
  });

  it("placing on center is rejected", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "place", pos: CENTER });
    expect(next).toBe(s);
  });

  it("placing first piece sets placeBuf", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "place", pos: 0 });
    expect(next.board[0]).toBe("P");
    expect(next.placeBuf).toBe(0);
    expect(next.pHand).toBe(11);
    expect(next.turn).toBe("P"); // still P's turn (second placement)
  });

  it("countPieces works correctly", () => {
    const board = new Array(25).fill(null);
    board[0] = "P"; board[1] = "P"; board[2] = "B";
    expect(countPieces(board, "P")).toBe(2);
    expect(countPieces(board, "B")).toBe(1);
  });

  it("isTerminal null mid-game", () => {
    expect(isTerminal(initialState(0, {}))).toBeNull();
  });

  it("isTerminal 100 for P win", () => {
    const s = { ...initialState(0, {}), winner: "P" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("isTerminal 0 for B win", () => {
    const s = { ...initialState(0, {}), winner: "B" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("rejects placing on occupied square", () => {
    const s = initialState(0, {});
    const board = [...s.board];
    board[1] = "B";
    const s2 = { ...s, board };
    const next = reducer(s2, { type: "place", pos: 1 });
    expect(next).toBe(s2);
  });
});
