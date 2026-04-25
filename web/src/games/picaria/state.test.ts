import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, checkWinner } from "./state.js";

describe("Picaria", () => {
  it("starts empty with player's turn", () => {
    const s = initialState(0, {});
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.turn).toBe("P");
    expect(s.pPlaced).toBe(0);
  });

  it("placing occupies the position", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "place", pos: 4 });
    expect(next.board[4]).toBe("P");
    expect(next.pPlaced).toBe(1);
  });

  it("rejects placing on occupied square", () => {
    const s = initialState(0, {});
    const s2 = { ...s, board: s.board.map((c, i) => (i === 0 ? "P" : c)) as ("P"|"B"|null)[] };
    const s3 = reducer(s2, { type: "place", pos: 0 });
    expect(s3).toBe(s2);
  });

  it("checkWinner detects horizontal win", () => {
    const board = new Array(9).fill(null);
    board[0] = "P"; board[1] = "P"; board[2] = "P";
    expect(checkWinner(board)).toBe("P");
  });

  it("checkWinner returns null for no win", () => {
    const board = new Array(9).fill(null);
    board[0] = "P"; board[4] = "B";
    expect(checkWinner(board)).toBeNull();
  });

  it("isTerminal null mid-game", () => {
    expect(isTerminal(initialState(0, {}))).toBeNull();
  });

  it("isTerminal score 100 on P win", () => {
    const s = { ...initialState(0, {}), winner: "P" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("isTerminal score 0 on B win", () => {
    const s = { ...initialState(0, {}), winner: "B" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
