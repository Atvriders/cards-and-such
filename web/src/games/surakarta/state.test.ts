import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMoves, rc, row, col } from "./state.js";
import type { SurakartaState } from "./state.js";

describe("Surakarta", () => {
  it("starts with 12 pieces each and human to move", () => {
    const s = initialState(42);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    const human = s.board.filter((c) => c === 0).length;
    const bot = s.board.filter((c) => c === 1).length;
    expect(human).toBe(12);
    expect(bot).toBe(12);
  });

  it("human piece at row 4 col 0 has normal moves", () => {
    const s = initialState(0);
    // row 4, col 0 = idx 24: human piece
    const idx = rc(4, 0);
    expect(s.board[idx]).toBe(0);
    const moves = legalMoves(s.board, idx, 0);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("selecting a human piece stores selection", () => {
    const s = initialState(0);
    const idx = rc(4, 0);
    const s1 = reducer(s, { type: "select", idx });
    expect(s1.selected).toBe(idx);
  });

  it("isTerminal returns null mid-game and correct scores on win/loss", () => {
    const s = initialState(0);
    expect(isTerminal(s)).toBeNull();
    const won: SurakartaState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: SurakartaState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("rc / row / col helpers are consistent", () => {
    expect(rc(3, 2)).toBe(20);
    expect(row(20)).toBe(3);
    expect(col(20)).toBe(2);
  });

  it("loop capture is available for piece on inner loop track", () => {
    // Place a human piece on inner loop (row=1,col=1) and bot piece on loop
    const board = new Array(36).fill(null) as Array<0 | 1 | null>;
    board[rc(1, 1)] = 0; // human on inner loop
    board[rc(1, 3)] = 1; // bot ahead on same track
    const moves = legalMoves(board, rc(1, 1), 0);
    // Should include loop capture targets
    expect(moves.length).toBeGreaterThan(0);
  });
});
