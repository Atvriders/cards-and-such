import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, MAX_PINCHES, TOTAL_CARDS } from "./state.js";
const S = { dummy: false };
describe("PipPinch", () => {
  it("starts in playing with 12 cards", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.cards.length).toBe(TOTAL_CARDS); expect(s.removed.every(b => !b)).toBe(true); });
  it("pinch removes a card and increments pinch count", () => { const s = reducer(initialState(1, S), { type:"pinch", index:0 }); expect(s.removed[0]).toBe(true); expect(s.pinches).toBe(1); });
  it("cannot pinch more than MAX_PINCHES cards", () => {
    let s = initialState(1, S);
    for (let i = 0; i < MAX_PINCHES; i++) s = reducer(s, { type:"pinch", index:i });
    expect(s.pinches).toBe(MAX_PINCHES);
    s = reducer(s, { type:"pinch", index:MAX_PINCHES });
    expect(s.pinches).toBe(MAX_PINCHES);
  });
  it("finish moves to done and assigns non-negative score", () => { const s = reducer(initialState(1, S), { type:"finish" }); expect(s.phase).toBe("done"); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null until finished", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
