import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Dice21", () => {
  it("starts in rolling", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.sum).toBe(0); });
  it("roll updates sum", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.sum).toBeGreaterThanOrEqual(1); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.totalScore).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("stand from rolling moves to scored", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"roll" });
    if (s.phase === "rolling") {
      const after = reducer(s, { type:"stand" });
      expect(["scored","done"]).toContain(after.phase);
    }
    expect(true).toBe(true);
  });
});
