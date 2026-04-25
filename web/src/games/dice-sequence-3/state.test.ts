import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkSequence } from "./state.js";
const S = { rounds: "5" as const };
describe("DiceSequence3", () => {
  it("checkSequence works correctly", () => {
    expect(checkSequence([1,2,3])).toBe(true);
    expect(checkSequence([4,5,6])).toBe(true);
    expect(checkSequence([1,3,5])).toBe(false);
    expect(checkSequence([1,1,2])).toBe(false);
  });
  it("starts with 3 dice", () => { const s = initialState(42, S); expect(s.dice.length).toBe(3); });
  it("rolling advances round", () => { const s = initialState(42, S); const s2 = reducer(s, { type: "roll" }); expect(s2.round).toBe(2); });
  it("game ends after all rounds", () => { let s = initialState(1, S); for (let i = 0; i < 5; i++) s = reducer(s, { type: "roll" }); expect(isTerminal(s)).not.toBeNull(); });
});
