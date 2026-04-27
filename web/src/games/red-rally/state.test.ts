import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isHit, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("RedRally", () => {
  it("starts in drawing phase", () => { const s = initialState(1, S); expect(s.phase).toBe("drawing"); expect(s.score).toBe(0); });
  it("draw produces a card", () => { const s = reducer(initialState(1, S), { type: "draw" }); expect(s.card).not.toBeNull(); });
  it("score non-negative after full play", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type: "draw" });
      if (s.phase === "shown") s = reducer(s, { type: "next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isHit returns boolean for any card 0..51", () => { for (let c = 0; c < 52; c++) expect(typeof isHit(c)).toBe("boolean"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type: "draw" });
      if (s.phase === "shown") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});
