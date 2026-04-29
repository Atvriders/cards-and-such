import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Schummeln Bluff", () => {
  it("starts in predict phase", () => { const s = initialState(1, S); expect(s.phase).toBe("predict"); });
  it("predict produces dice", () => { const s = reducer(initialState(1, S), { type: "predict", choice: 0 }); expect(s.dice.length).toBeGreaterThanOrEqual(1); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type: "predict", choice: 0 }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
