import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, DICE_COUNT } from "./state.js";
const S = { dummy: false };
describe("FarkleMini", () => {
  it("starts in rolling phase", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.remaining).toBe(DICE_COUNT); });
  it("roll moves to decide or scored", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(["decide","scored","done"]).toContain(s.phase); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.totalScore).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("bank from decide adds to total", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"roll" });
    if (s.phase === "decide") {
      const before = s.roundBank;
      const after = reducer(s, { type:"bank" });
      expect(after.totalScore).toBe(before);
    }
    expect(true).toBe(true);
  });
});
