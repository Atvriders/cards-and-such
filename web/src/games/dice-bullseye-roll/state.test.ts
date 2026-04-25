import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "5" as const };
describe("DiceBullseyeRoll", () => {
  it("starts with target and dice", () => { const s = initialState(42, S); expect(s.target).toBeGreaterThanOrEqual(2); expect(s.dice.length).toBe(2); });
  it("scores on bullseye", () => {
    let found = false;
    for (let seed = 0; seed < 100; seed++) { const s = initialState(seed, S); if (s.total === s.target) { found = true; break; } }
    expect(found).toBe(true);
  });
  it("rolling advances round", () => { const s = initialState(42, S); const s2 = reducer(s, { type: "roll" }); expect(s2.round).toBe(2); });
  it("game ends after all rounds", () => { let s = initialState(1, S); for (let i = 0; i < 5; i++) s = reducer(s, { type: "roll" }); expect(isTerminal(s)).not.toBeNull(); });
});
