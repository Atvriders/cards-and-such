import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("MiniRummy", () => {
  it("starts with 7 cards", () => { const s = initialState(1, S); expect(s.hand.length).toBe(7); expect(s.phase).toBe("play"); });
  it("score returns to scored phase", () => { const s = reducer(initialState(1, S), { type:"score" }); expect(["scored","done"]).toContain(s.phase); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type:"score" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
