import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Red Dog Progressive", () => {
  it("starts in ready phase", () => { expect(initialState(1, S).phase).toBe("ready"); });
  it("score starts at 0", () => { expect(initialState(1, S).score).toBeGreaterThanOrEqual(0); });
  it("play yields a result", () => { const s = reducer(initialState(2, S), { type: "play" }); expect(s.result.length).toBeGreaterThanOrEqual(1); });
  it("play yields non-negative pts", () => { const s = reducer(initialState(3, S), { type: "play" }); expect(s.pts).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
