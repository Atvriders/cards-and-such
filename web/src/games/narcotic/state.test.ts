import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findMatchBelow } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = {};

function makeCard(suit: Card["suit"], rank: Card["rank"], id: string): Card {
  return { suit, rank, id };
}

describe("Narcotic initialState", () => {
  it("deals all 52 cards to stock", () => {
    const s = initialState(42, settings);
    expect(s.stock.length).toBe(52);
    expect(s.pile.length).toBe(0);
  });

  it("pile starts empty", () => {
    const s = initialState(1, settings);
    expect(s.pile).toEqual([]);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.stock.map((c) => c.id)).toEqual(s2.stock.map((c) => c.id));
  });

  it("different seeds produce different stocks", () => {
    const s1 = initialState(1, settings);
    const s2 = initialState(2, settings);
    expect(s1.stock.map((c) => c.id)).not.toEqual(s2.stock.map((c) => c.id));
  });
});

describe("Narcotic findMatchBelow", () => {
  it("returns -1 for pile with fewer than 2 cards", () => {
    expect(findMatchBelow([])).toBe(-1);
    expect(findMatchBelow([makeCard("♠", 5, "a")])).toBe(-1);
  });

  it("finds matching rank below top", () => {
    const pile = [
      makeCard("♠", 7, "a"),
      makeCard("♥", 3, "b"),
      makeCard("♣", 7, "c"), // top
    ];
    expect(findMatchBelow(pile)).toBe(0); // index 0 matches rank 7
  });

  it("finds matching suit below top", () => {
    const pile = [
      makeCard("♦", 2, "a"),
      makeCard("♥", 9, "b"),
      makeCard("♦", 5, "c"), // top — matches suit ♦ at index 0
    ];
    expect(findMatchBelow(pile)).toBe(0);
  });

  it("returns -1 when no match", () => {
    const pile = [
      makeCard("♠", 2, "a"),
      makeCard("♥", 5, "b"), // top — no match in rank or suit with ♠2
    ];
    expect(findMatchBelow(pile)).toBe(-1);
  });
});

describe("Narcotic reducer", () => {
  it("draw moves top of stock to pile", () => {
    const s = initialState(42, settings);
    const topOfStock = s.stock[s.stock.length - 1]!;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(51);
    expect(next.pile[next.pile.length - 1]!.id).toBe(topOfStock.id);
  });

  it("draw on empty stock returns same state", () => {
    const s = { ...initialState(42, settings), stock: [] };
    const next = reducer(s, { type: "draw" });
    expect(next).toBe(s);
  });

  it("remove collapses cards in between", () => {
    const pile = [
      makeCard("♠", 7, "a"), // index 0
      makeCard("♥", 3, "b"), // index 1 — between
      makeCard("♠", 5, "c"), // index 2 — top (suit ♠ matches index 0)
    ];
    const s = { ...initialState(1, settings), stock: [], pile };
    const next = reducer(s, { type: "remove", targetIndex: 0 });
    // Should remove index 1 (the between card)
    expect(next.pile.length).toBe(2);
    expect(next.pile[0]!.id).toBe("a");
    expect(next.pile[1]!.id).toBe("c");
  });

  it("invalid remove returns same state", () => {
    const pile = [
      makeCard("♠", 7, "a"),
      makeCard("♥", 3, "b"), // top
    ];
    const s = { ...initialState(1, settings), stock: [], pile };
    // index 0 is ♠7, top is ♥3 — no match
    const next = reducer(s, { type: "remove", targetIndex: 0 });
    expect(next).toBe(s);
  });
});

describe("Narcotic isTerminal", () => {
  it("returns null if not won", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, settings), won: true, score: 75 };
    expect(isTerminal(s)).toEqual({ score: 75 });
  });
});
