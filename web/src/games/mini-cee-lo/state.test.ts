import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateRoll } from "./state.js";
const S = { dummy: false };
describe("MiniCeeLo", () => {
  it("starts in ready", () => { expect(initialState(1, S).phase).toBe("ready"); });
  it("4-5-6 scores 50", () => { expect(evaluateRoll([4,5,6]).pts).toBe(50); });
  it("triples score 30", () => { expect(evaluateRoll([3,3,3]).pts).toBe(30); });
  it("roll changes phase", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(["rolled","done"]).toContain(s.phase); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
