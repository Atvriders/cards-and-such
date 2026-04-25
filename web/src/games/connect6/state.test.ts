import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, SIZE } from "./state.js";

describe("Connect6", () => {
  it("starts with empty board, player 0 turn, 1 stone", () => {
    const s = initialState(0, {});
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.turn).toBe(0);
    expect(s.stonesLeft).toBe(1);
    expect(s.winner).toBeNull();
  });

  it("placing first stone places black at that cell", () => {
    const s = initialState(42, {});
    const center = Math.floor((SIZE * SIZE) / 2);
    const next = reducer(s, { type: "place", cell: center });
    // After placing 1 stone, bot responds with its stone(s)
    expect(next.board[center]).toBe(0); // human stone stays
    expect(next.winner).toBeNull();
  });

  it("rejects placing on occupied cell", () => {
    const s = initialState(0, {});
    const center = Math.floor((SIZE * SIZE) / 2);
    const next = reducer(s, { type: "place", cell: center });
    const again = reducer(next, { type: "place", cell: center });
    expect(again).toBe(next);
  });

  it("isTerminal returns null mid-game and scores at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
  });

  it("detects win for player 0 with 6 in a row", () => {
    const s = initialState(0, {});
    // Build board with 5 black stones, then place 6th
    const board = [...s.board] as (0 | 1 | null)[];
    for (let c = 0; c < 5; c++) board[c] = 0; // row 0 cols 0-4 = black
    // Place 6th at col 5 row 0
    const s2 = { ...s, board, turn: 0 as const, stonesLeft: 1, moveCount: 5 };
    const result = reducer(s2, { type: "place", cell: 5 });
    expect(result.winner).toBe(0);
  });
});
