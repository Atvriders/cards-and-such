import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = {} as never;

describe("tri-peaks-continuous", () => {
  it("starts with a board", () => {
    const s = initialState(1, S);
    expect(s.columns.length).toBeGreaterThan(0);
  });
  it("is deterministic under the same seed", () => {
    const a = initialState(5, S);
    const b = initialState(5, S);
    expect(a.stock.length).toBe(b.stock.length);
  });
  it("draw moves stock to waste", () => {
    const s0 = initialState(2, S);
    if (s0.stock.length === 0) return;
    const s1 = reducer(s0, { type: "draw" });
    expect(s1.waste.length).toBe(s0.waste.length + 1);
  });
  it("isTerminal is null on a fresh deal", () => {
    const s = initialState(3, S);
    expect(isTerminal(s)).toBeNull();
  });
});
