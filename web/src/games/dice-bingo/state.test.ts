import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, countCompleteLines } from "./state.js";
const S = { dummy: false };
describe("DiceBingo", () => {
  it("starts at round 1 with 25-cell grid", () => {
    const s = initialState(1, S);
    expect(s.round).toBe(1);
    expect(s.grid.length).toBe(25);
    expect(s.marked.every(m => !m)).toBe(true);
  });
  it("roll moves to rolled phase", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.phase).toBe("rolled");
    expect(s.lastRoll).toBeGreaterThanOrEqual(1);
  });
  it("mark increases score by at least 5", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"roll" });
    const idx = s.grid.findIndex(v => v === s.lastRoll);
    if (idx >= 0) {
      s = reducer(s, { type:"mark", idx });
      expect(s.score).toBeGreaterThanOrEqual(5);
      expect(s.marked[idx]).toBe(true);
    }
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS skips", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"roll" });
      s = reducer(s, { type:"skip" });
    }
    expect(s.phase).toBe("done");
  });
  it("countCompleteLines: full row counts as 1", () => {
    const m = Array(25).fill(false);
    for (let i = 0; i < 5; i++) m[i] = true;
    expect(countCompleteLines(m)).toBe(1);
  });
});
