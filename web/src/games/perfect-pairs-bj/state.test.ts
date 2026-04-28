import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Perfect Pairs Blackjack", () => {
  it("starts in play phase", () => { expect(initialState(1, S).phase).toBe("play"); });
  it("has two cards initially", () => { expect(initialState(1, S).hand.length).toBeGreaterThanOrEqual(2); });
  it("stand scores non-negative", () => { const s = reducer(initialState(2, S), { type: "stand" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("hit adds card or busts", () => { const s = reducer(initialState(3, S), { type: "hit" }); expect(s.hand.length).toBeGreaterThanOrEqual(2); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
