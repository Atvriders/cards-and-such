import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("OverUnder", () => {
  it("starts in predict phase", () => { const s = initialState(1, S); expect(s.phase).toBe("predict"); });
  it("predict produces dice and result/done", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"over" }); expect(s.dice).not.toBeNull(); expect(["result","done"]).toContain(s.phase); });
  it("score is 0 or 10 after one round", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"under" }); expect([0,10]).toContain(s.score); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
