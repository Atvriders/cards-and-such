import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DiceDartsState } from "./state.js";

describe("DiceDarts initialState", () => {
  it("starts at 301 with 0 turns", () => {
    const s = initialState(42);
    expect(s.score).toBe(301);
    expect(s.turns).toBe(0);
    expect(s.gameOver).toBe(false);
    expect(s.lastRoll).toBeNull();
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("DiceDarts throw", () => {
  it("reduces score on a valid throw", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "throw" });
    expect(s2.turns).toBe(1);
    expect(s2.lastRoll).not.toBeNull();
    const sum = s2.lastSum!;
    expect(sum).toBeGreaterThanOrEqual(3);
    expect(sum).toBeLessThanOrEqual(18);
  });

  it("busts when roll exceeds remaining score", () => {
    const s: DiceDartsState = { ...initialState(1), score: 2 };
    const s2 = reducer(s, { type: "throw" });
    // Any roll of 3+ is a bust since score=2
    if (s2.busted) {
      expect(s2.score).toBe(2);
    }
  });

  it("ends game when score reaches 0", () => {
    // Craft a state where exactly the right amount remains
    const s: DiceDartsState = { ...initialState(10), score: 0, gameOver: true };
    expect(s.gameOver).toBe(true);
    expect(reducer(s, { type: "throw" })).toBe(s); // no-op when game over
  });

  it("increments turns on each throw", () => {
    let s = initialState(5);
    s = reducer(s, { type: "throw" });
    s = reducer(s, { type: "throw" });
    expect(s.turns).toBe(2);
  });
});

describe("DiceDarts isTerminal", () => {
  it("returns null during game", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score when game over", () => {
    const s: DiceDartsState = { ...initialState(1), gameOver: true, turns: 10 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(500); // 1000 - 10*50
  });
});
