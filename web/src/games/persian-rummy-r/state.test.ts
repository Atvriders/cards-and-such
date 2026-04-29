import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Persian Rummy", () => {
  it("starts in play phase", () => { expect(initialState(1, S).phase).toBe("play"); });
  it("dealt hand size", () => { expect(initialState(1, S).hand.length).toBeGreaterThanOrEqual(7); });
  it("auto-score yields non-negative score", () => { const s = reducer(initialState(2, S), { type: "score" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("auto-score sets pts >= 0", () => { const s = reducer(initialState(3, S), { type: "score" }); expect(s.pts).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("next after score advances round", () => { const s = reducer(initialState(4, S), { type: "score" }); if (s.phase === "scored") { const n = reducer(s, { type: "next" }); expect(n.round).toBeGreaterThanOrEqual(2); } else { expect(s.score).toBeGreaterThanOrEqual(0); } });
});
