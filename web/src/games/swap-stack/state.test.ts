import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("SwapStack", () => {
  it("starts in decide", () => { const s = initialState(1, S); expect(s.phase).toBe("decide"); expect(s.card).not.toBeNull(); });
  it("keep advances to scored", () => { const s = reducer(initialState(1, S), { type:"keep" }); expect(["scored","done"]).toContain(s.phase); });
  it("score is non-negative after keep", () => { const s = reducer(initialState(1, S), { type:"keep" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"keep" });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
