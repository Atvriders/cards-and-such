import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isFace, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardCleanSweep", () => {
  it("starts in drawing with 26 cards", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("drawing");
    expect(s.pile.length).toBe(26);
    expect(s.round).toBe(1);
  });
  it("isFace checks face cards", () => {
    expect(isFace(9)).toBe(true);  // J
    expect(isFace(0)).toBe(false); // 2
    expect(isFace(11)).toBe(true); // K
    expect(isFace(12)).toBe(false); // A
  });
  it("draw reduces pile and adds score", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "draw" });
    expect(s.pile.length).toBeLessThanOrEqual(25);
    expect(s.score).toBeGreaterThanOrEqual(1);
  });
  it("4 rounds total", () => { expect(TOTAL_ROUNDS).toBe(4); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
