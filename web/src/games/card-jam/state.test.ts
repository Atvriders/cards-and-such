import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, suitOf, TOTAL_CARDS } from "./state.js";
const S = { dummy: false };
describe("CardJam", () => {
  it("16 cards dealt", () => { expect(initialState(1,S).cards.length).toBe(TOTAL_CARDS); });
  it("starts in playing", () => { expect(initialState(1,S).phase).toBe("playing"); });
  it("jam advances index", () => { const s=reducer(initialState(1,S),{type:"jam",jar:0}); expect(s.idx).toBe(1); });
  it("correct jar adds points", () => { const s=initialState(1,S); const correct=suitOf(s.cards[0]!); const s2=reducer(s,{type:"jam",jar:correct}); expect(s2.score).toBeGreaterThanOrEqual(12); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
