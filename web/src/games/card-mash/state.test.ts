import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, suitOf } from "./state.js";
const S = { dummy: false };
describe("CardMash", () => {
  it("starts dealing", () => { expect(initialState(1,S).phase).toBe("dealing"); });
  it("deal yields 5 cards", () => { const s=reducer(initialState(1,S),{type:"deal"}); expect(s.hand.length).toBe(5); });
  it("score non-negative", () => { const s=reducer(initialState(1,S),{type:"deal"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("suitOf returns 0..3", () => { for(let c=0;c<52;c++){ expect(suitOf(c)).toBeGreaterThanOrEqual(0); expect(suitOf(c)).toBeLessThanOrEqual(3); } });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
