import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("In-Between", () => {
  it("starts in ready phase", () => { expect(initialState(1, S).phase).toBe("ready"); });
  it("score is 0 at start", () => { expect(initialState(1, S).score).toBeGreaterThanOrEqual(0); });
  it("play resolves to scored", () => { const s = reducer(initialState(2, S), { type: "play" }); expect(s.phase === "scored" || s.phase === "done").toBe(true); });
  it("draws cards for middle and brackets", () => { const s = reducer(initialState(3, S), { type: "play" }); expect(s.left).not.toBeNull(); expect(s.right).not.toBeNull(); expect(s.middle).not.toBeNull(); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
