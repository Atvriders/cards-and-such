import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreCategory } from "./state.js";
const S = { dummy: false };
describe("MiniYahtzee", () => {
  it("starts with 3 rolls left", () => { expect(initialState(1, S).rollsLeft).toBe(3); });
  it("roll decrements counter", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.rollsLeft).toBe(2); });
  it("scoreCategory handles ones", () => { expect(scoreCategory(0, [1,1,2,3,4])).toBe(2); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
