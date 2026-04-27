import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, NUM_DICE } from "./state.js";
const S = { dummy: false };
describe("MiniTenzi", () => {
  it("starts with 10 dice", () => { expect(initialState(1, S).dice.length).toBe(NUM_DICE); });
  it("starts in play", () => { expect(initialState(1, S).phase).toBe("play"); });
  it("roll increments rolls", () => { const s0 = initialState(1, S); const s = reducer(s0, { type:"roll" }); expect(s.rolls).toBeGreaterThanOrEqual(s0.rolls); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
