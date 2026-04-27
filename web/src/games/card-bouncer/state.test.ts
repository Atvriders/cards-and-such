import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankOf, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("CardBouncer", () => {
  it("starts in deciding with a current card", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("deciding");
    expect(s.current).not.toBeNull();
  });
  it("rankOf: Ace=14, King=13, 2=2", () => {
    expect(rankOf(12)).toBe(14);
    expect(rankOf(11)).toBe(13);
    expect(rankOf(0)).toBe(2);
  });
  it("accept advances draw and adds rank to score", () => {
    const s = initialState(1, S);
    const r = rankOf(s.current!);
    const s2 = reducer(s, { type: "accept" });
    expect(s2.score).toBe(r);
  });
  it("reject increments bounceCount up to 1", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "reject" });
    expect(s.bounceCount).toBe(1);
  });
  it("12 draws total", () => { expect(TOTAL_DRAWS).toBe(12); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
