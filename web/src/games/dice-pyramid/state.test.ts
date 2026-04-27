import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, pyramidScore, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DicePyramid", () => {
  it("starts in rolling", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); });
  it("roll produces 6 dice", () => { const s = reducer(initialState(1, S), { type: "roll" }); expect(s.dice?.length).toBe(6); });
  it("pyramidScore: all 1s = 200 - 5*6 + 60 = 230", () => { expect(pyramidScore([1,1,1,1,1,1]).pts).toBe(230); });
  it("pyramidScore: all 6s = 200-5*36, floored", () => { expect(pyramidScore([6,6,6,6,6,6]).pts).toBe(20); });
  it("score is non-negative across full play", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});
