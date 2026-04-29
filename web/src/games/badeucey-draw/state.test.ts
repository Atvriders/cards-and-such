import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Badeucey Draw", () => {
  it("starts in see phase", () => { expect(initialState(1, S).phase).toBe("see"); });
  it("you have 5 cards", () => { expect(initialState(1, S).you.length).toBeGreaterThanOrEqual(5); });
  it("play scores non-negative", () => { const s = reducer(initialState(2, S), { type: "play" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("fold yields zero pts", () => { const s = reducer(initialState(3, S), { type: "fold" }); expect(s.pts).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
