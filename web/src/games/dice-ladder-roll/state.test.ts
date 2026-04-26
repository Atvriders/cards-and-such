import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceLadderRoll", () => {
  it("starts in waiting phase with 0 score and 0 streak", () => { const s = initialState(1, S); expect(s.phase).toBe("waiting"); expect(s.score).toBe(0); expect(s.streak).toBe(0); });
  it("roll reveals a die between 1 and 6", () => { const s = reducer(initialState(2, S), { type:"roll" }); if (s.currentDie !== null) { expect(s.currentDie).toBeGreaterThanOrEqual(1); expect(s.currentDie).toBeLessThanOrEqual(6); } });
  it("score is non-negative after roll", () => { const s = reducer(initialState(3, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
