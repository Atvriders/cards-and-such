import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isStraight, isFlush, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("StraightSearch", () => {
  it("starts in dealing", () => { const s = initialState(1, S); expect(s.phase).toBe("dealing"); expect(s.score).toBe(0); });
  it("deal produces hand of 5 cards", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.hand.length).toBe(5); });
  it("score is non-negative after deal", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isStraight detects 2-3-4-5-6", () => { expect(isStraight([0,1,2,3,4])).toBe(true); });
  it("isStraight false on non-consecutive", () => { expect(isStraight([0,1,2,3,5])).toBe(false); });
  it("isFlush detects same suit", () => { expect(isFlush([0,1,2,3,4])).toBe(true); expect(isFlush([0,13,26,39,1])).toBe(false); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after 10 draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) { s = reducer(s, { type:"deal" }); if (i < TOTAL_DRAWS - 1) s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
});
