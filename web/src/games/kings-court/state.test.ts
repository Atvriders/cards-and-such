import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("KingsCourt", () => {
  it("starts in dealing", () => { const s = initialState(1, S); expect(s.phase).toBe("dealing"); expect(s.score).toBe(0); });
  it("deal produces a hand", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.hand.length).toBeGreaterThan(0); });
  it("score is non-negative after deal", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) { s = reducer(s, { type:"deal" }); if (i < TOTAL_DRAWS - 1) s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
});
