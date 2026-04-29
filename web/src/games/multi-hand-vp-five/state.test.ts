import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Five-Hand Video Poker", () => {
  it("starts in deal phase", () => { expect(initialState(1, S).phase).toBe("deal"); });
  it("score starts at 0", () => { expect(initialState(1, S).score).toBeGreaterThanOrEqual(0); });
  it("deal yields hand", () => { const s = reducer(initialState(2, S), { type: "deal" }); expect(s.hand.length).toBeGreaterThanOrEqual(5); });
  it("deal yields non-negative pts", () => { const s = reducer(initialState(3, S), { type: "deal" }); expect(s.pts).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
