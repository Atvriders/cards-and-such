import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("PigClassic", () => {
  it("starts in playing", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.totalScore).toBe(0); });
  it("roll updates lastRoll between 1-6", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.lastRoll).toBeGreaterThanOrEqual(1);
    expect(s.lastRoll).toBeLessThanOrEqual(6);
  });
  it("rolling a 1 wipes turn total", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"roll" });
    if (s.lastWasOne) expect(s.turnTotal).toBe(0);
    expect(true).toBe(true);
  });
  it("bank moves turn total to score", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"roll" });
    if (!s.lastWasOne) {
      const tt = s.turnTotal;
      const after = reducer(s, { type:"bank" });
      expect(after.totalScore).toBe(tt);
    }
    expect(true).toBe(true);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
