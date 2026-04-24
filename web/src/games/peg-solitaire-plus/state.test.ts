import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PegSolitairePlusState } from "./state.js";

describe("PegSolitairePlus initialState", () => {
  it("diamond board has centre hole", () => {
    const s = initialState(1, { variant: "diamond" });
    expect(s.board[4 * 9 + 4]).toBe(2); // center is hole
  });

  it("plus board has centre hole", () => {
    const s = initialState(1, { variant: "plus" });
    expect(s.board[4 * 9 + 4]).toBe(2);
  });

  it("diamond has more than 20 pegs", () => {
    const s = initialState(1, { variant: "diamond" });
    expect(s.pegsLeft).toBeGreaterThan(20);
  });

  it("starts not won and not stuck", () => {
    const s = initialState(1, { variant: "diamond" });
    expect(s.won).toBe(false);
    expect(s.stuck).toBe(false);
  });
});

describe("PegSolitairePlus reducer", () => {
  it("selecting a peg sets selected", () => {
    const s = initialState(1, { variant: "plus" });
    // Find first peg
    const pegIdx = s.board.indexOf(1);
    const s2 = reducer(s, { type: "select", index: pegIdx });
    expect(s2.selected).toBe(pegIdx);
  });

  it("selecting non-peg clears selection", () => {
    const s = initialState(1, { variant: "plus" });
    const pegIdx = s.board.indexOf(1);
    const s2 = reducer(s, { type: "select", index: pegIdx });
    const holeIdx = s.board.indexOf(2);
    const s3 = reducer(s2, { type: "select", index: holeIdx });
    expect(s3.selected).toBeNull();
  });

  it("valid jump removes middle peg", () => {
    const s = initialState(1, { variant: "plus" });
    // Center is hole at (4,4), pegs at (4,3) and (4,2) on plus board
    // Select peg at (4,2) → jump over (4,3) → land at (4,4)
    const from = 4 * 9 + 2; // row4, col2
    const over = 4 * 9 + 3; // row4, col3
    const to = 4 * 9 + 4;   // row4, col4 (the hole)
    expect(s.board[from]).toBe(1);
    expect(s.board[over]).toBe(1);
    expect(s.board[to]).toBe(2);
    const s2 = reducer(s, { type: "select", index: from });
    const s3 = reducer(s2, { type: "move", index: to });
    expect(s3.board[from]).toBe(2);
    expect(s3.board[over]).toBe(2);
    expect(s3.board[to]).toBe(1);
    expect(s3.pegsLeft).toBe(s.pegsLeft - 1);
  });

  it("no-op when won", () => {
    const s = initialState(1, { variant: "plus" });
    const won: PegSolitairePlusState = { ...s, won: true };
    const s2 = reducer(won, { type: "select", index: s.board.indexOf(1) });
    expect(s2.selected).toBeNull();
  });
});

describe("PegSolitairePlus isTerminal", () => {
  it("returns null when game in progress", () => {
    expect(isTerminal(initialState(1, { variant: "diamond" }))).toBeNull();
  });

  it("returns 1000 when won", () => {
    const s = initialState(1, { variant: "diamond" });
    const won: PegSolitairePlusState = { ...s, won: true };
    expect(isTerminal(won)!.score).toBe(1000);
  });

  it("returns score when stuck", () => {
    const s = initialState(1, { variant: "diamond" });
    const stuck: PegSolitairePlusState = { ...s, stuck: true, pegsLeft: 5 };
    const result = isTerminal(stuck);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
