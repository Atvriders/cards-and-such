import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DICE_COUNT } from "./state.js";
const S = { dummy: false };
describe("HighPointCraps", () => {
  it("starts in roll phase", () => { expect(initialState(1,S).phase).toBe("roll"); });
  it("roll produces dice", () => { const s=reducer(initialState(1,S), { type:"roll" }); expect(s.dice.length).toBeGreaterThanOrEqual(DICE_COUNT); });
  it("score is non-negative", () => { const s=reducer(initialState(1,S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("rounds reasonable", () => { expect(TOTAL_ROUNDS).toBeGreaterThanOrEqual(5); });
});
