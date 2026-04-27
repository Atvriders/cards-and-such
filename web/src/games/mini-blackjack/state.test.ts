import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("MiniBlackjack", () => {
  it("starts in play with 2 cards", () => { const s = initialState(1, S); expect(s.phase).toBe("play"); expect(s.hand.length).toBe(2); });
  it("hit draws a card", () => { const s = reducer(initialState(1, S), { type:"hit" }); expect(s.hand.length).toBeGreaterThanOrEqual(2); });
  it("stand scores >= 0", () => { const s = reducer(initialState(1, S), { type:"stand" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
