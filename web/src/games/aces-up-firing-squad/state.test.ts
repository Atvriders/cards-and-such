import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = {} as never;

describe("aces-up-firing-squad", () => {
  it("starts with four columns and a stock", () => {
    const s = initialState(1, S);
    expect(s.columns.length).toBe(4);
    expect(s.stock.length).toBe(48);
  });
  it("is deterministic under the same seed", () => {
    const a = initialState(7, S);
    const b = initialState(7, S);
    expect(a.columns[0]?.[0]?.id).toBe(b.columns[0]?.[0]?.id);
  });
  it("deal pushes one card to each column", () => {
    const s0 = initialState(2, S);
    const s1 = reducer(s0, { type: "deal" });
    expect(s1.stock.length).toBe(s0.stock.length - 4);
  });
  it("isTerminal is null on a fresh deal", () => {
    const s = initialState(3, S);
    expect(isTerminal(s)).toBeNull();
  });
});
