import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("3-2-1 Countdown", () => {
  it("starts in rolling phase", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); });
  it("roll produces dice", () => { const s = reducer(initialState(1, S), { type: "roll" }); expect(s.dice).not.toBeNull(); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type: "roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
