import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, STACK } from "./state.js";
const S = { dummy: false };
describe("DiceFrenzyTall", () => {
  it("starts in rolling with 5 dice", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.dice.length).toBe(STACK);
  });
  it("toggle selects dice", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "toggle", index: 0 });
    expect(s.selected[0]).toBe(true);
  });
  it("reroll requires selection", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "reroll" });
    expect(s.rerollUsed).toBe(false); // no selection, no reroll
  });
  it("lock moves to result", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "lock" });
    expect(s.phase).toBe("result");
  });
  it("6 rounds total", () => { expect(TOTAL_ROUNDS).toBe(6); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
