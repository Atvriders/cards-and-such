import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isWin, TARGET } from "./state.js";

const S = { dummy: false };

describe("dice-railroad", () => {
  it("starts at track 0", () => {
    const s = initialState(1, S);
    expect(s.track).toBe(0);
    expect(s.turn).toBe(1);
  });
  it("isWin reports doubles", () => {
    expect(isWin(3, 3)).toBe(true);
    expect(isWin(2, 5)).toBe(false);
  });
  it("laying track moves the train", () => {
    const s = reducer(initialState(2, S), { type: "lay" });
    expect(s.track).toBeGreaterThan(0);
    expect(s.score).toBeGreaterThan(0);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("track never exceeds TARGET", () => {
    let s = initialState(4, S);
    for (let i = 0; i < 50 && s.phase !== "done"; i++) {
      if (s.phase === "lay") s = reducer(s, { type: "lay" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.track).toBeLessThanOrEqual(TARGET);
    expect(s.phase).toBe("done");
  });
});
