import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("ParityPop", () => {
  it("starts in predict phase", () => { const s = initialState(1, S); expect(s.phase).toBe("predict"); });
  it("predict produces die and result/done", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"even" }); expect(s.die).not.toBeNull(); expect(["result","done"]).toContain(s.phase); });
  it("score is 0 or 8 after one prediction", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"odd" }); expect([0,8]).toContain(s.score); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
