import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceSpikeRoll", () => {
  it("starts in waiting phase with 0 score", () => { const s = initialState(1, S); expect(s.phase).toBe("waiting"); expect(s.score).toBe(0); });
  it("roll reveals 2 dice", () => { const s = reducer(initialState(2, S), { type:"roll" }); expect(s.dice).not.toBeNull(); if (s.dice) expect(s.dice.length).toBe(2); });
  it("score is non-negative", () => { const s = reducer(initialState(3, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
