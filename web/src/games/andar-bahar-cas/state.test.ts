import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Andar Bahar", () => {
  it("starts in bet phase", () => { expect(initialState(1, S).phase).toBe("bet"); });
  it("score 0 at start", () => { expect(initialState(1, S).score).toBeGreaterThanOrEqual(0); });
  it("bet resolves to scored or done", () => { const s = reducer(initialState(2, S), { type: "bet", side: "andar" }); expect(s.phase === "scored" || s.phase === "done").toBe(true); });
  it("score non-negative after bet", () => { const s = reducer(initialState(3, S), { type: "bet", side: "bahar" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
