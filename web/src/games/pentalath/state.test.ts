import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, hasWon, hexKey, onBoard } from "./state.js";
import type { PentalathState } from "./state.js";

describe("Pentalath", () => {
  it("starts with empty board and correct player", () => {
    const s = initialState(0);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    for (const v of s.board.values()) expect(v).toBeNull();
  });

  it("onBoard is correct for radius 5", () => {
    expect(onBoard(0, 0)).toBe(true);
    expect(onBoard(5, 0)).toBe(true);
    expect(onBoard(4, 1)).toBe(true);
    expect(onBoard(6, 0)).toBe(false);
    expect(onBoard(3, 3)).toBe(false); // |q+r|=6>5
  });

  it("placing a stone switches turn", () => {
    const s = initialState(0);
    const s1 = reducer(s, { type: "place", q: 0, r: 0 });
    expect(s1.board.get(hexKey(0, 0))).toBe(0);
  });

  it("hasWon detects 5 connected pieces", () => {
    const board = new Map<string, 0 | 1 | null>();
    // Place 5 in a row horizontally
    for (let q = 0; q < 5; q++) {
      board.set(hexKey(q, 0), 0);
    }
    expect(hasWon(board, 0)).toBe(true);
    expect(hasWon(board, 1)).toBe(false);
  });

  it("hasWon returns false for 4 pieces", () => {
    const board = new Map<string, 0 | 1 | null>();
    for (let q = 0; q < 4; q++) board.set(hexKey(q, 0), 0);
    expect(hasWon(board, 0)).toBe(false);
  });

  it("isTerminal returns null mid-game and correct scores", () => {
    const s = initialState(0);
    expect(isTerminal(s)).toBeNull();
    const won: PentalathState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: PentalathState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
