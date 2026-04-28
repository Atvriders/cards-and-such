import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceBazaar", () => {
  it("starts rolling at round 1", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.round).toBe(1); });
  it("roll produces 5 dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice.length).toBe(5); });
  it("score >= 0 after roll", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("rounds >= 10", () => { expect(TOTAL_ROUNDS).toBeGreaterThanOrEqual(10); });
});
