import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { NumericTTTState } from "./state.js";

describe("NumericTTT initialState", () => {
  it("starts with odd numbers for human and even for ai", () => {
    const s = initialState(42);
    expect(s.humanNumbers).toEqual([1, 3, 5, 7, 9]);
    expect(s.aiNumbers).toEqual([2, 4, 6, 8]);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.currentPlayer).toBe("human");
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("NumericTTT selectNumber", () => {
  it("sets selectedNumber", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "selectNumber", number: 3 });
    expect(s2.selectedNumber).toBe(3);
  });

  it("ignores invalid number", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "selectNumber", number: 2 }); // 2 is AI's
    expect(s2.selectedNumber).toBeNull();
  });
});

describe("NumericTTT place", () => {
  it("places number on board and removes from humanNumbers", () => {
    let s = initialState(1);
    s = reducer(s, { type: "selectNumber", number: 5 });
    s = reducer(s, { type: "place", index: 4 });
    expect(s.board[4]).toBe(5);
    expect(s.humanNumbers).not.toContain(5);
  });

  it("detects human win when three odd numbers sum to 15", () => {
    // Set up board: human has 1,5,9 in positions 0,4,8
    const s: NumericTTTState = {
      ...initialState(1),
      board: [1, null, null, null, 5, null, null, null, null],
      humanNumbers: [3, 7, 9],
      selectedNumber: 9,
      currentPlayer: "human",
    };
    const s2 = reducer(s, { type: "place", index: 8 });
    expect(s2.winner).toBe("human");
    expect(s2.gameOver).toBe(true);
  });
});

describe("NumericTTT isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns 1000 on human win", () => {
    const s: NumericTTTState = { ...initialState(1), gameOver: true, winner: "human" };
    expect(isTerminal(s)!.score).toBe(1000);
  });

  it("returns 500 on draw", () => {
    const s: NumericTTTState = { ...initialState(1), gameOver: true, winner: "draw" };
    expect(isTerminal(s)!.score).toBe(500);
  });
});
