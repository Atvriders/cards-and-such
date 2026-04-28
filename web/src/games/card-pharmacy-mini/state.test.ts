import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("CardPharmacyMini", () => {
  it("starts in drawing", () => { const s = initialState(1, S); expect(s.phase).toBe("drawing"); expect(s.score).toBe(0); });
  it("draw produces a card and points", () => {
    const s = reducer(initialState(1, S), { type:"draw" });
    expect(s.card).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(2);
  });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after total draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type:"draw" });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
