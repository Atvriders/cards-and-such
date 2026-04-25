import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "5" as const };
describe("DicePyramidStack", () => {
  it("starts with 3 dice", () => { const s = initialState(42, S); expect(s.dice.length).toBe(3); });
  it("banking a die scores points", () => { const s = initialState(42, S); const s2 = reducer(s, { type: "bank", index: 0 }); expect(s2.score).toBeGreaterThan(0); });
  it("rolling advances round", () => { const s = initialState(42, S); const s2 = reducer(s, { type: "roll" }); expect(s2.round).toBe(2); });
  it("game ends after all rounds", () => { let s = initialState(1, S); for (let i = 0; i < 5; i++) s = reducer(s, { type: "roll" }); expect(isTerminal(s)).not.toBeNull(); });
});
