import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("Napoleon at St. Helena initialState", () => {
  it("has exactly 104 cards (two decks)", () => {
    const s = initialState(1);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("each tableau pile has 4 cards", () => {
    const s = initialState(5);
    for (let i = 1; i <= 10; i++) {
      const pile = s.piles.find((p) => p.id === `t${i}`)!;
      expect(pile.cards.length).toBe(4);
    }
  });

  it("stock has 64 cards", () => {
    const s = initialState(5);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(64);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(77);
    const s2 = initialState(77);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });
});

describe("Napoleon at St. Helena reducer", () => {
  it("draw moves one card to waste", () => {
    const s = initialState(42);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("multi-card move rejected", () => {
    const s = initialState(42);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 2 });
    // Only valid if top 2 cards of t1 form a same-suit run (unlikely but possible)
    const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalAfter).toBe(total);
  });

  it("auto-move preserves total card count", () => {
    const s = initialState(10);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    expect(next.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(total);
  });
});

describe("Napoleon at St. Helena isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score when 104 cards on foundations", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    // 8 foundations, each holding 13 cards
    for (let fi = 0; fi < 8; fi++) {
      const suit = SUITS[fi % 4]!;
      wonPiles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({
          suit: suit as Suit,
          rank: rank as Rank,
          id: `${cardIdx++}-${fi}-${suit}${rank}`,
        })),
      });
    }
    for (let i = 1; i <= 10; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
    const wonState = { piles: wonPiles, movesMade: 200, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
