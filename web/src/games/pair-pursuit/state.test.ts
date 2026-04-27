import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestMatch } from "./state.js";
const S = { dummy: false };
describe("PairPursuit", () => {
  it("starts in ready", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); });
  it("roll produces 4 dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice.length).toBe(4); expect(["rolled","done"]).toContain(s.phase); });
  it("score is non-negative after rolling", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("bestMatch detects 4-of-a-kind", () => { expect(bestMatch([3,3,3,3]).pts).toBe(100); });
  it("bestMatch detects pair", () => { expect(bestMatch([1,2,3,3]).pts).toBe(20); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
