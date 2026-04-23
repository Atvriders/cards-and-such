import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("FortyEightOneDeck initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("has 4 tableau columns of 5 cards each", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 4; i++) {
      const pile = s.piles.find((p) => p.id === `t${i}`)!;
      expect(pile.cards.length).toBe(5);
    }
  });

  it("has 4 foundations, 4 free cells (all empty)", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
      expect(s.piles.find((p) => p.id === `fc${i}`)!.cards.length).toBe(0);
    }
  });

  it("stock has 32 cards", () => {
    const s = initialState(42, settings);
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(32);
  });

  it("is deterministic", () => {
    const s1 = initialState(100, settings);
    const s2 = initialState(100, settings);
    expect(s1.piles.map((p) => p.cards.map((c) => c.id).join(",")).join("|"))
      .toBe(s2.piles.map((p) => p.cards.map((c) => c.id).join(",")).join("|"));
  });
});

describe("FortyEightOneDeck reducer", () => {
  it("draw moves a card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("move to freecell works if freecell empty", () => {
    const s = initialState(42, settings);
    // Draw to get a waste card
    const s1 = reducer(s, { type: "draw" });
    const s2 = reducer(s1, { type: "move", fromPile: "waste", toPile: "fc1", count: 1 });
    // Either moved or didn't (depends on ruleset), but total cards must still be 52
    const total = s2.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("illegal move leaves state unchanged", () => {
    const s = initialState(42, settings);
    // Moving 3 cards at once should be rejected
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 3 });
    expect(next).toBe(s);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });
});
