import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, CELL_COUNT, hexCells, BASE } from "./state.js";

describe("Havannah", () => {
  it("starts with empty board, player 0 turn", () => {
    const s = initialState(0, {});
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.board.length).toBe(CELL_COUNT);
  });

  it("hexCells returns correct count for base 5", () => {
    const cells = hexCells(BASE);
    expect(cells.length).toBe(61);
  });

  it("placing a stone fills that cell", () => {
    const s = initialState(42, {});
    const next = reducer(s, { type: "place", cell: 0 });
    expect(next.board[0]).toBe(0);
    expect(next.winner).toBeNull();
  });

  it("rejects placing on occupied cell", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "place", cell: 0 });
    const again = reducer(next, { type: "place", cell: 0 });
    expect(again).toBe(next);
  });

  it("isTerminal returns null mid-game and scores at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
  });
});
