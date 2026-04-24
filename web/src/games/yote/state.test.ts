import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getMovesFor, rc } from "./state.js";
import type { YoteState } from "./state.js";

describe("Yoté", () => {
  it("starts with 12 stones each in hand and empty board", () => {
    const s = initialState(0);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.inHand).toEqual([12, 12]);
    expect(s.board.every((c) => c === null)).toBe(true);
  });

  it("placing a stone decrements inHand", () => {
    const s = initialState(0);
    const s1 = reducer(s, { type: "place", to: 0 });
    // After human places, it's bot's turn (which also places)
    expect(s1.inHand[0]).toBeLessThan(12);
  });

  it("getMovesFor returns placement moves when stones in hand", () => {
    const board = new Array(30).fill(null) as Array<0 | 1 | null>;
    const moves = getMovesFor(board, 5, 0);
    expect(moves.some((m) => m.from === "hand")).toBe(true);
    expect(moves.length).toBe(30); // 30 empty squares
  });

  it("jump capture is generated when opponent piece is adjacent and beyond is empty", () => {
    const board = new Array(30).fill(null) as Array<0 | 1 | null>;
    board[rc(2, 2)] = 0; // human
    board[rc(2, 3)] = 1; // bot
    // rc(2,4) is empty
    const moves = getMovesFor(board, 0, 0);
    const cap = moves.find((m) => m.captured !== undefined);
    expect(cap).toBeDefined();
    expect(cap!.captured).toBe(rc(2, 3));
    expect(cap!.to).toBe(rc(2, 4));
  });

  it("isTerminal returns null mid-game, correct scores on win/loss", () => {
    const s = initialState(0);
    expect(isTerminal(s)).toBeNull();
    const won: YoteState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: YoteState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
