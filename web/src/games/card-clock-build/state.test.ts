import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("CardClockBuild", () => {
  it("starts in play phase with deck", () => { const s = initialState(1, S); expect(s.phase).toBe("play"); expect(s.deck.length).toBe(52); });
  it("draw produces a current card", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.current).not.toBeNull(); });
  it("score is non-negative after place", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"draw" });
    s = reducer(s, { type:"place", slot:1 });
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
