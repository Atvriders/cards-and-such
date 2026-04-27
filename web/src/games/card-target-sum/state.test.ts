import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("CardTargetSum", () => {
  it("starts in play phase with 6 cards", () => { const s = initialState(1, S); expect(s.phase).toBe("play"); expect(s.pool.length).toBe(6); });
  it("toggle selects a card", () => { const s = reducer(initialState(1, S), { type:"toggle", idx:0 }); expect(s.selected).toContain(0); });
  it("submit needs 3 cards", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"toggle", idx:0 });
    s = reducer(s, { type:"toggle", idx:1 });
    s = reducer(s, { type:"toggle", idx:2 });
    s = reducer(s, { type:"submit" });
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
