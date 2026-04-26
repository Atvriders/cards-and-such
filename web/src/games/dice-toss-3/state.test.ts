import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceToss3", () => {
  it("starts in waiting phase with 0 score", () => { const s = initialState(1, S); expect(s.phase).toBe("waiting"); expect(s.score).toBe(0); });
  it("toss reveals 3 dice and adds score", () => { const s = reducer(initialState(2, S), { type:"toss" }); expect(s.dice).not.toBeNull(); if (s.dice) expect(s.dice.length).toBe(3); expect(s.score).toBeGreaterThan(0); });
  it("dice values are between 1 and 6", () => { const s = reducer(initialState(3, S), { type:"toss" }); if (s.dice) { for (const d of s.dice) { expect(d).toBeGreaterThanOrEqual(1); expect(d).toBeLessThanOrEqual(6); } } });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
