import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("QuartetQuest", () => {
  it("starts in drawing", () => { const s = initialState(1, S); expect(s.phase).toBe("drawing"); expect(s.draw).toBe(0); });
  it("draw advances state", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.draw).toBe(1); expect(s.hand.length).toBe(1); });
  it("score is non-negative", () => { const s = reducer(initialState(7, S), { type:"draw" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after TOTAL_DRAWS draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type:"draw" });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
