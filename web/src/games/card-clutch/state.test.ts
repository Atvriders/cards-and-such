import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankOf, TOTAL_ROUNDS, NORMAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardClutch", () => {
  it("starts in predict phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("predict");
    expect(s.round).toBe(1);
  });
  it("predict produces card and result", () => {
    const s = reducer(initialState(1, S), { type: "predict", choice: "high" });
    expect(s.card).not.toBeNull();
    expect(s.phase).toBe("result");
  });
  it("score is non-negative after predict", () => {
    const s = reducer(initialState(1, S), { type: "predict", choice: "high" });
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("8 normal rounds + 1 clutch = 9 total", () => {
    expect(NORMAL_ROUNDS).toBe(8);
    expect(TOTAL_ROUNDS).toBe(9);
  });
  it("rankOf works", () => {
    expect(rankOf(0)).toBe(2);
    expect(rankOf(12)).toBe(14);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
