import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Queens Puzzle", () => {
  it("starts in playing phase", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); });
  it("has at least one puzzle", () => { const s = initialState(1, S); expect(s.puzzles.length).toBeGreaterThanOrEqual(1); });
  it("select stores choice", () => { const s = reducer(initialState(1, S), { type: "select", choice: 1 }); expect(s.selected).toBe(1); });
  it("submit moves to result phase", () => { let s = reducer(initialState(1, S), { type: "select", choice: 0 }); s = reducer(s, { type: "submit" }); expect(s.phase).toBe("result"); });
  it("score is non-negative integer", () => { let s = reducer(initialState(1, S), { type: "select", choice: 0 }); s = reducer(s, { type: "submit" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
