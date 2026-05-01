import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = {} as never;

describe("pyramid-solitaire-classic", () => {
  it("starts with a populated pyramid", () => {
    const s = initialState(1, S);
    expect(s.pyramid.length).toBeGreaterThan(0);
    const total = s.pyramid.flat().filter((c) => c).length + s.stock.length;
    expect(total).toBe(52);
  });
  it("draw moves a card from stock to waste", () => {
    const s0 = initialState(2, S);
    const s1 = reducer(s0, { type: "draw" });
    expect(s1.stock.length).toBe(s0.stock.length - 1);
    expect(s1.waste.length).toBe(s0.waste.length + 1);
  });
  it("is deterministic under the same seed", () => {
    const a = initialState(7, S);
    const b = initialState(7, S);
    expect(a.stock.length).toBe(b.stock.length);
  });
  it("isTerminal is null on a fresh deal", () => {
    const s = initialState(3, S);
    expect(isTerminal(s)).toBeNull();
  });
});
