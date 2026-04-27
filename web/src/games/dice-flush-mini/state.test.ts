import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bonusFor, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceFlushMini", () => {
  it("starts in rolling", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); });
  it("roll produces 5 dice and adds points", () => { const s = reducer(initialState(1, S), { type: "roll" }); expect(s.dice).not.toBeNull(); expect(s.score).toBeGreaterThanOrEqual(30); });
  it("bonusFor: 5 same = 280", () => { expect(bonusFor([6,6,6,6,6]).pts).toBe(280); });
  it("bonusFor: 3 same = 80", () => { expect(bonusFor([1,1,1,2,3]).pts).toBe(80); });
  it("bonusFor: no match = 30", () => { expect(bonusFor([1,2,3,4,5]).pts).toBe(30); });
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
