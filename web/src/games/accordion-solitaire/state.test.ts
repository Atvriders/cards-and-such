import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = {} as never;

describe("accordion-solitaire", () => {
  it("starts with all 52 cards", () => {
    const s = initialState(1, S);
    expect(s.cards.length).toBe(52);
  });
  it("is deterministic under the same seed", () => {
    const a = initialState(7, S);
    const b = initialState(7, S);
    expect(a.cards[0]?.id).toBe(b.cards[0]?.id);
  });
  it("rejects invalid collapses", () => {
    const s0 = initialState(3, S);
    const s1 = reducer(s0, { type: "collapse", from: 5, to: 0 });
    expect(s1).toBe(s0);
  });
  it("isTerminal is null on a fresh deal", () => {
    const s = initialState(2, S);
    expect(isTerminal(s)).toBeNull();
  });
});
