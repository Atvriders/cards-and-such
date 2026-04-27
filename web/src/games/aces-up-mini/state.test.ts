import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isAce, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("AcesUpMini", () => {
  it("starts in drawing phase", () => { const s = initialState(1, S); expect(s.phase).toBe("drawing"); expect(s.score).toBe(0); });
  it("draw produces a card", () => { const s = reducer(initialState(1, S), { type: "draw" }); expect(s.card).not.toBeNull(); });
  it("score is non-negative", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type: "draw" });
      if (s.phase === "shown") s = reducer(s, { type: "next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isAce: position 12 is Ace", () => { expect(isAce(12)).toBe(true); expect(isAce(0)).toBe(false); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after 12 draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type: "draw" });
      if (s.phase === "shown") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});
