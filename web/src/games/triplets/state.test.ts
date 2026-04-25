import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Triplets initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const pileCards = s.piles.reduce((sum, p) => sum + p.length, 0);
    expect(pileCards + s.stock.length).toBe(52);
  });

  it("has 12 piles of 3 cards each", () => {
    const s = initialState(1);
    expect(s.piles.length).toBe(12);
    for (const pile of s.piles) expect(pile.length).toBe(3);
  });

  it("stock has 16 cards", () => {
    const s = initialState(5);
    expect(s.stock.length).toBe(16);
  });

  it("is deterministic", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.piles.flat().map(c => c.id).join(",")).toBe(
      s2.piles.flat().map(c => c.id).join(",")
    );
  });
});

describe("Triplets reducer", () => {
  it("select adds pile to selected", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "select", pileIdx: 0 });
    expect(next.selected).toContain(0);
  });

  it("deselect removes from selected", () => {
    let s = initialState(42);
    s = reducer(s, { type: "select", pileIdx: 0 });
    s = reducer(s, { type: "deselect", pileIdx: 0 });
    expect(s.selected).not.toContain(0);
  });

  it("cannot select more than 3 piles", () => {
    let s = initialState(42);
    s = reducer(s, { type: "select", pileIdx: 0 });
    s = reducer(s, { type: "select", pileIdx: 1 });
    s = reducer(s, { type: "select", pileIdx: 2 });
    const next = reducer(s, { type: "select", pileIdx: 3 });
    expect(next.selected.length).toBe(3);
  });

  it("remove-triplet fails when selected < 3", () => {
    let s = initialState(42);
    s = reducer(s, { type: "select", pileIdx: 0 });
    const pileCardsBefore = s.piles.reduce((sum, p) => sum + p.length, 0);
    const next = reducer(s, { type: "remove-triplet" });
    expect(next.piles.reduce((sum, p) => sum + p.length, 0)).toBe(pileCardsBefore); // nothing removed
  });

  it("isTerminal null when not won", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });
});
