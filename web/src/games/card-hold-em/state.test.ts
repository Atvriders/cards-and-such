import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isStrongHand, pokerRank, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardHoldEm", () => {
  it("starts in predict phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("predict");
  });
  it("isStrongHand: pair counts as strong", () => {
    // Two 2s: same rank
    expect(isStrongHand([0, 13])).toBe(true);
  });
  it("isStrongHand: low cards are weak", () => {
    // 2 + 3
    expect(isStrongHand([0, 1])).toBe(false);
  });
  it("predict produces hand and result/done", () => {
    const s = reducer(initialState(1, S), { type: "predict", choice: "strong" });
    expect(s.hand).not.toBeNull();
    expect(["result", "done"]).toContain(s.phase);
  });
  it("pokerRank Ace=14, King=13", () => {
    // 12 % 13 = 12 -> Ace=14. 11 % 13 = 11 -> King=13
    expect(pokerRank(12)).toBe(14);
    expect(pokerRank(11)).toBe(13);
  });
  it("TOTAL_ROUNDS is 12", () => { expect(TOTAL_ROUNDS).toBe(12); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
