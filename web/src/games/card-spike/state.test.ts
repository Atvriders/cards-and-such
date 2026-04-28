import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankOf } from "./state.js";
const S = { dummy: false };
describe("CardSpike", () => {
  it("starts in draw", () => { expect(initialState(1,S).phase).toBe("draw"); });
  it("targetRank in 0..12", () => { const s=initialState(1,S); expect(s.targetRank).toBeGreaterThanOrEqual(0); expect(s.targetRank).toBeLessThanOrEqual(12); });
  it("draw produces card", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.card).not.toBeNull(); });
  it("rankOf 0..12", () => { for(let c=0;c<52;c++){ expect(rankOf(c)).toBeLessThanOrEqual(12);} });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
