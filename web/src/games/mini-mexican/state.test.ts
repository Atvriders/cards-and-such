import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("MiniMexican", () => {
  it("starts in ready", () => { expect(initialState(1, S).phase).toBe("ready"); });
  it("roll produces dice and points", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice).not.toBeNull(); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("score is at least 12 (smallest non-double pair = 31)", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(12); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
