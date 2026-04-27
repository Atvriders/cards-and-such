import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, NUM_DICE } from "./state.js";
const S = { dummy: false };
describe("DiceFrenzyMini", () => {
  it("starts in selecting with 10 dice", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("selecting");
    expect(s.dice.length).toBe(NUM_DICE);
  });
  it("target is 30..40", () => {
    const s = initialState(1, S);
    expect(s.target).toBeGreaterThanOrEqual(30);
    expect(s.target).toBeLessThanOrEqual(40);
  });
  it("toggle flips selection", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "toggle", index: 0 });
    expect(s.selected[0]).toBe(true);
    s = reducer(s, { type: "toggle", index: 0 });
    expect(s.selected[0]).toBe(false);
  });
  it("submit moves to result phase", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "submit" });
    expect(s.phase).toBe("result");
  });
  it("8 rounds total", () => { expect(TOTAL_ROUNDS).toBe(8); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
