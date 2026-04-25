import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("BingoCall initialState", () => {
  it("starts with FREE center and all else unmarked", () => {
    const s = initialState(42);
    expect(s.card[2]![2]).toBe(0);      // FREE
    expect(s.marked[2]![2]).toBe(true); // center daubed
    expect(s.marked[0]![0]).toBe(false);
    expect(s.calledNumbers).toHaveLength(0);
    expect(s.gameOver).toBe(false);
  });

  it("has exactly 75 numbers in call pool", () => {
    const s = initialState(1);
    expect(s.callPool).toHaveLength(75);
    const sorted = [...s.callPool].sort((a, b) => a - b);
    expect(sorted[0]).toBe(1);
    expect(sorted[74]).toBe(75);
  });

  it("is deterministic", () => {
    expect(initialState(99)).toEqual(initialState(99));
  });
});

describe("BingoCall call", () => {
  it("moves a number from pool to called and updates marked", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "call" });
    expect(s2.calledNumbers).toHaveLength(1);
    expect(s2.callPool).toHaveLength(74);
    expect(s2.lastCall).not.toBeNull();
  });

  it("auto-daubs matching numbers on the card", () => {
    const s = initialState(1);
    // Call all numbers until at least one matches
    let current = s;
    for (let i = 0; i < 10; i++) {
      const prev = current;
      current = reducer(current, { type: "call" });
      const calledNum = current.lastCall!;
      // Check if the card has this number and if it's marked
      let found = false;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (prev.card[r]![c] === calledNum) {
            expect(current.marked[r]![c]).toBe(true);
            found = true;
          }
        }
      }
      void found;
    }
  });

  it("detects bingo eventually", () => {
    // Call all 75 numbers — bingo must happen
    let s = initialState(42);
    while (!s.gameOver) {
      s = reducer(s, { type: "call" });
    }
    expect(s.bingo).toBe(true);
    expect(s.gameOver).toBe(true);
  });
});

describe("BingoCall isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns positive score on bingo", () => {
    let s = initialState(42);
    while (!s.gameOver) s = reducer(s, { type: "call" });
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});
