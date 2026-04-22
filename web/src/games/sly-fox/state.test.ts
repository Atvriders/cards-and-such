import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, slyFoxRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank, Card } from "../../engines/deck/index.js";

const settings = {};

describe("SlyFox initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("has 20 tableau slots each with 1 card", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 20; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(1);
    }
  });

  it("foundations start with 4 Aces, one per suit", () => {
    const s = initialState(1, settings);
    for (let fi = 1; fi <= 4; fi++) {
      const f = s.piles.find((p) => p.id === `f${fi}`)!;
      expect(f.cards.length).toBe(1);
      expect(f.cards[0]!.rank).toBe(1);
    }
    // All 4 suits should be represented
    const foundSuits = new Set(
      [1,2,3,4].map(fi => s.piles.find((p) => p.id === `f${fi}`)!.cards[0]!.suit)
    );
    expect(foundSuits.size).toBe(4);
  });
});

describe("SlyFox ruleset", () => {
  it("foundation accepts next rank in same suit", () => {
    const target: Pile = {
      id: "f1", kind: "foundation",
      cards: [{ id: "a1", suit: "♠", rank: 1 }],
    };
    const moving: Card[] = [{ id: "a2", suit: "♠", rank: 2 }];
    expect(slyFoxRuleset.canStack(target, moving)).toBe(true);
  });

  it("no tableau-to-tableau building allowed", () => {
    const target: Pile = {
      id: "t1", kind: "tableau",
      cards: [{ id: "a1", suit: "♠", rank: 9 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "a2", suit: "♦", rank: 8 }];
    expect(slyFoxRuleset.canStack(target, moving)).toBe(false);
  });
});

describe("SlyFox reducer", () => {
  it("draw moves card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
    expect(next.movesMade).toBe(1);
  });

  it("redeal when stock not empty is blocked", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "redeal" });
    expect(next).toBe(s);
  });

  it("redeal decrements redealsLeft", () => {
    let s = initialState(42, settings);
    // Drain the stock first
    while (s.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      s = reducer(s, { type: "draw" });
    }
    expect(s.redealsLeft).toBe(2);
    const next = reducer(s, { type: "redeal" });
    expect(next.redealsLeft).toBe(1);
  });
});

describe("SlyFox isTerminal", () => {
  it("returns null initially", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when all 52 cards on foundations", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (let fi = 1; fi <= 4; fi++) {
      const suit = SUITS[fi - 1]!;
      wonPiles.push({
        id: `f${fi}`, kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${cardIdx++}` })),
      });
    }
    for (let i = 1; i <= 20; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
    const wonState = { piles: wonPiles, score: 480, movesMade: 100, redealsLeft: 1, won: true, settings };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(480);
  });
});
