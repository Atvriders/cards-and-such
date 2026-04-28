import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("DiceTrail", () => {
  it("starts rolling", () => { expect(initialState(1,S).phase).toBe("rolling"); });
  it("roll yields 5 dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice.length).toBe(5); });
  it("ascCount in 0..4", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.ascCount).toBeGreaterThanOrEqual(0); expect(s.ascCount).toBeLessThanOrEqual(4); });
  it("score non-negative", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
