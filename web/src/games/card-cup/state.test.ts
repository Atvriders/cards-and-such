import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankOf } from "./state.js";
const S = { dummy: false };
describe("CardCup", () => {
  it("starts in choose", () => { expect(initialState(1,S).phase).toBe("choose"); });
  it("pick produces a card", () => { const s=reducer(initialState(1,S),{type:"pick",cup:"low"}); expect(s.card).not.toBeNull(); });
  it("score is non-negative", () => { const s=reducer(initialState(1,S),{type:"pick",cup:"high"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("rankOf 0..12", () => { for(let c=0;c<52;c++){ expect(rankOf(c)).toBeGreaterThanOrEqual(0); expect(rankOf(c)).toBeLessThanOrEqual(12);} });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
