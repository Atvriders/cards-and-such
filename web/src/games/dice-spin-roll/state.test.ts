import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceSpinRoll", () => {
  it("starts in waiting phase with 0 score", () => { const s = initialState(1, S); expect(s.phase).toBe("waiting"); expect(s.score).toBe(0); });
  it("has a target between 7 and 13", () => { const s = initialState(2, S); expect(s.target).toBeGreaterThanOrEqual(7); expect(s.target).toBeLessThanOrEqual(13); });
  it("spin adds score and reveals dice", () => { const s = reducer(initialState(3, S), { type:"spin" }); expect(s.score).toBeGreaterThanOrEqual(0); expect(s.dice).not.toBeNull(); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
