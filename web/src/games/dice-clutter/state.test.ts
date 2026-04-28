import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("DiceClutter", () => {
  it("starts rolling", () => { expect(initialState(1,S).phase).toBe("rolling"); });
  it("roll yields 8 dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice.length).toBe(8); });
  it("dice values 1..6", () => { const s=reducer(initialState(1,S),{type:"roll"}); for(const d of s.dice){ expect(d).toBeGreaterThanOrEqual(1); expect(d).toBeLessThanOrEqual(6); } });
  it("score >= 3", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.score).toBeGreaterThanOrEqual(3); });
  it("isTerminal null start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
