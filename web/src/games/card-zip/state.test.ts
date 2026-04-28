import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankOf } from "./state.js";
const S = { dummy: false };
describe("CardZip", () => {
  it("starts in dealing", () => { expect(initialState(1,S).phase).toBe("dealing"); });
  it("deal yields 5 cards", () => { const s=reducer(initialState(1,S),{type:"deal"}); expect(s.hand.length).toBe(5); });
  it("ascCount in 0..4", () => { const s=reducer(initialState(1,S),{type:"deal"}); expect(s.ascCount).toBeGreaterThanOrEqual(0); expect(s.ascCount).toBeLessThanOrEqual(4); });
  it("rankOf in range", () => { for(let c=0;c<52;c++){ expect(rankOf(c)).toBeLessThanOrEqual(12);} });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
