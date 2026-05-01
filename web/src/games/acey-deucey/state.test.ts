import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE } from "./state.js";

const S = { dummy: false };

describe("acey-deucey", () => {
  it("starts in rolling phase with both sides at full strength", () => {
    const s = initialState(123, S);
    expect(s.phase).toBe("rolling");
    expect(s.turn).toBe("P");
    expect(s.pBorne).toBe(0);
    expect(s.cBorne).toBe(0);
    const pSum = s.pPoints.reduce((a, b) => a + b, 0);
    const cSum = s.cPoints.reduce((a, b) => a + b, 0);
    expect(pSum).toBe(CHECKERS_PER_SIDE);
    expect(cSum).toBe(CHECKERS_PER_SIDE);
  });

  it("roll transitions to moving and produces dice", () => {
    const s0 = initialState(7, S);
    const s = reducer(s0, { type: "roll" });
    expect(s.dice.length).toBeGreaterThanOrEqual(2);
    expect(s.dice.every(d => d >= 1 && d <= 6)).toBe(true);
  });

  it("legalMoves returns at least one option after rolling", () => {
    const s0 = initialState(99, S);
    const s = reducer(s0, { type: "roll" });
    if (s.phase === "moving") {
      const m = legalMoves(s, "P");
      expect(m.length).toBeGreaterThan(0);
    }
  });

  it("isTerminal is null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("track is exactly POINTS long with valid layout", () => {
    expect(POINTS).toBeGreaterThanOrEqual(12);
    const s = initialState(1, S);
    expect(s.pPoints.length).toBe(POINTS);
    expect(s.cPoints.length).toBe(POINTS);
    expect(s.pinned.length).toBe(POINTS);
  });

  it("end turn passes control to CPU and returns to P rolling", () => {
    const s0 = initialState(31, S);
    const s = reducer(s0, { type: "endTurn" });
    // CPU plays, then it's player's turn rolling again (or game done)
    expect(["rolling", "done"]).toContain(s.phase);
  });

  it("invalid move does not crash", () => {
    const s0 = initialState(11, S);
    const s = reducer(s0, { type: "move", from: 99, pips: 1 });
    // Should be ignored (still rolling)
    expect(s.phase).toBe("rolling");
  });
});
