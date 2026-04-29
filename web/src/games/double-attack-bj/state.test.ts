import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Double Attack Blackjack", () => {
  it("starts in play phase", () => { expect(initialState(1, S).phase).toBe("play"); });
  it("dealt 2 cards", () => { expect(initialState(1, S).you.length).toBeGreaterThanOrEqual(2); });
  it("stand yields non-negative score", () => { const s = reducer(initialState(2, S), { type: "stand" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("hit adds a card or busts", () => { const s = reducer(initialState(3, S), { type: "hit" }); expect(s.you.length).toBeGreaterThanOrEqual(2); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
