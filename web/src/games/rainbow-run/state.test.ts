import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("RainbowRun", () => {
  it("starts in drawing", () => { const s = initialState(1, S); expect(s.phase).toBe("drawing"); expect(s.score).toBe(0); });
  it("draw advances counter", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.drawn).toBe(1); expect(s.lastCard).not.toBeNull(); });
  it("score is non-negative after a draw", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) s = reducer(s, { type:"draw" });
    expect(s.phase).toBe("done");
  });
});
