import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("DoubleDown", () => {
  it("starts in ready", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); });
  it("roll produces 2 dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice).not.toBeNull(); expect(s.dice!.length).toBe(2); });
  it("delta is +30 or -5", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect([30, -5]).toContain(s.lastDelta); });
  it("isTerminal floors score at 0", () => { const s = { ...initialState(1, S), phase:"done" as const, score: -50 }; expect(isTerminal(s)).toEqual({ score: 0 }); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
