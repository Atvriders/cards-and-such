import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreForSum, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceTarget", () => {
  it("starts in rolling phase", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); });
  it("roll produces 3 dice and a score", () => { const s = reducer(initialState(1, S), { type: "roll" }); expect(s.dice).not.toBeNull(); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("scoreForSum: 12 = 100, 11 = 92", () => { expect(scoreForSum(12)).toBe(100); expect(scoreForSum(11)).toBe(92); });
  it("scoreForSum is non-negative", () => { for (let i = 0; i < 25; i++) expect(scoreForSum(i)).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after 10 rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});
