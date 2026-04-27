import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evalHand, MAX_ROLLS } from "./state.js";
const S = { dummy: false };
describe("DiceHandPoker", () => {
  it("starts in rolling phase", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.rollsLeft).toBe(MAX_ROLLS); });
  it("evalHand 5-of-kind", () => { expect(evalHand([3,3,3,3,3]).points).toBe(600); });
  it("evalHand pair", () => { expect(evalHand([1,1,3,4,5]).points).toBe(30); });
  it("evalHand straight", () => { expect(evalHand([1,2,3,4,5]).points).toBe(150); });
  it("evalHand full house", () => { expect(evalHand([2,2,2,3,3]).points).toBe(200); });
  it("roll moves dice and decrements rolls", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.rollsLeft).toBe(MAX_ROLLS - 1); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("after 3 rolls hand is scored", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"roll" });
    s = reducer(s, { type:"roll" });
    s = reducer(s, { type:"roll" });
    expect(["scored","done"]).toContain(s.phase);
  });
});
