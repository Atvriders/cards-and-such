import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DicePaddle", () => {
  it("starts in picking phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("picking");
    expect(s.round).toBe(1);
  });
  it("light pick produces a roll and result", () => {
    const s = reducer(initialState(1, S), { type: "pick", choice: "light" });
    expect(s.roll).not.toBeNull();
    expect(s.phase).toBe("result");
  });
  it("score is non-negative after picks", () => {
    const s = reducer(initialState(1, S), { type: "pick", choice: "light" });
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("10 rounds total", () => { expect(TOTAL_ROUNDS).toBe(10); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
