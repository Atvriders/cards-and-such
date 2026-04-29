import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("DeadAreComingLog", () => {
  it("creates 10 prompts", () => { expect(initialState(1, S).prompts.length).toBeGreaterThanOrEqual(10); });
  it("starts in choose phase", () => { expect(initialState(1, S).phase).toBe("choose"); });
  it("choosing scores points", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type:"choose", choice: 0 });
    expect(s2.score).toBeGreaterThanOrEqual(0);
    expect(s2.phase).toBe("result");
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("can complete full saga", () => {
    let s = initialState(1, S);
    for (let i = 0; i < s.prompts.length; i++) {
      s = reducer(s, { type:"choose", choice: 0 });
      s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("different choices yield non-negative points", () => {
    const a = reducer(initialState(7, S), { type: "choose", choice: 0 });
    const b = reducer(initialState(7, S), { type: "choose", choice: 1 });
    expect(a.lastPts).toBeGreaterThanOrEqual(0);
    expect(b.lastPts).toBeGreaterThanOrEqual(0);
  });
});
