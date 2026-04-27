import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("BlackBidder", () => {
  it("starts in predict phase", () => { const s = initialState(1, S); expect(s.phase).toBe("predict"); });
  it("predict reveals card and produces result/done", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"black" }); expect(s.card).not.toBeNull(); expect(["result","done"]).toContain(s.phase); });
  it("score is 0 or 10 after one prediction", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"black" }); expect([0,10]).toContain(s.score); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
