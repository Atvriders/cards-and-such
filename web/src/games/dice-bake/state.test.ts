import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("DiceBake", () => {
  it("starts rolling", () => { expect(initialState(1,S).phase).toBe("rolling"); });
  it("roll yields 3 dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice.length).toBe(3); });
  it("sum 3..18", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.sum).toBeGreaterThanOrEqual(3); expect(s.sum).toBeLessThanOrEqual(18); });
  it("score is non-negative", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
