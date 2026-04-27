import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, countPairs, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("PairPickup", () => {
  it("starts in dealing", () => { const s = initialState(1, S); expect(s.phase).toBe("dealing"); expect(s.score).toBe(0); });
  it("deal produces 5 cards", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.hand.length).toBe(5); });
  it("countPairs 0 for unique hand", () => { expect(countPairs([0, 1, 2, 3, 4])).toBe(0); });
  it("countPairs 1 for one pair", () => { expect(countPairs([0, 13, 2, 3, 4])).toBe(1); });
  it("countPairs 3 for three of a kind", () => { expect(countPairs([0, 13, 26, 3, 4])).toBe(3); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) { s = reducer(s, { type:"deal" }); if (i < TOTAL_DRAWS - 1) s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
});
