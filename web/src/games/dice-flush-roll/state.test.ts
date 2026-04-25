import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreFlush } from "./state.js";
const S = { rounds: "5" as const };
describe("DiceFlushRoll", () => {
  it("scoreFlush works", () => {
    expect(scoreFlush([1,1,1,1,1])).toBe(50);
    expect(scoreFlush([2,2,2,2,3])).toBe(30);
    expect(scoreFlush([3,3,3,1,2])).toBe(15);
    expect(scoreFlush([1,2,3,4,5])).toBe(0);
  });
  it("starts with 5 dice and 2 rerolls", () => { const s = initialState(42, S); expect(s.dice.length).toBe(5); expect(s.rollsLeft).toBe(2); });
  it("rerolling decreases rollsLeft", () => { const s = initialState(42, S); const s2 = reducer(s, { type: "reroll" }); expect(s2.rollsLeft).toBe(1); });
  it("scoring advances round", () => { const s = initialState(42, S); const s2 = reducer(s, { type: "score" }); expect(s2.round).toBe(2); });
});
