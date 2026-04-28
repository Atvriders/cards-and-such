import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, OPTIONS } from "./state.js";
const S = { dummy: false };
describe("DiceOrchestra", () => {
  it("starts in predict phase", () => { const s = initialState(1, S); expect(s.phase).toBe("predict"); expect(s.score).toBe(0); });
  it("has at least 2 options", () => { expect(OPTIONS.length).toBeGreaterThanOrEqual(2); });
  it("predict produces dice and result/done", () => { const s = reducer(initialState(1, S), { type:"predict", choice: "Strings" as never }); expect(s.dice).not.toBeNull(); expect(["result","done"]).toContain(s.phase); });
  it("score is non-negative after one round", () => { const s = reducer(initialState(1, S), { type:"predict", choice: "Strings" as never }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
