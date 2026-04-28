import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, suitOf } from "./state.js";
const S = { dummy: false };
describe("CardYank", () => {
  it("starts in dealing", () => { expect(initialState(1,S).phase).toBe("dealing"); });
  it("yank deals 7 cards", () => { const s=reducer(initialState(1,S),{type:"yank"}); expect(s.hand.length).toBe(7); });
  it("score non-negative", () => { const s=reducer(initialState(1,S),{type:"yank"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("suitOf 0..3", () => { for(let c=0;c<52;c++){ expect(suitOf(c)).toBeLessThanOrEqual(3);} });
  it("isTerminal null start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
