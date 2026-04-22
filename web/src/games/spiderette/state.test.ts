import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, spideretteRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank, Card } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Spiderette initialState", () => {
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

  it("tableau columns have correct sizes (triangle deal)", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 7; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(i);
      expect(t.faceUpCount).toBe(1);
    }
  });

  it("stock has 24 cards", () => {
    const s = initialState(1, settings);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(24);
  });
});

describe("Spiderette ruleset", () => {
  it("same-suit descending stack is valid", () => {
    const target: Pile = {
      id: "t1", kind: "tableau",
      cards: [{ id: "c1", suit: "♠", rank: 8 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "c2", suit: "♠", rank: 7 }];
    expect(spideretteRuleset.canStack(target, moving)).toBe(true);
  });

  it("different-suit stack is not valid", () => {
    const target: Pile = {
      id: "t1", kind: "tableau",
      cards: [{ id: "c1", suit: "♠", rank: 8 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "c2", suit: "♥", rank: 7 }];
    expect(spideretteRuleset.canStack(target, moving)).toBe(false);
  });
});

describe("Spiderette reducer", () => {
  it("deal-row adds cards to all 7 columns", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "deal-row" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 7);
    expect(next.movesMade).toBe(1);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("Spiderette isTerminal", () => {
  it("returns null initially", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when 4 suits completed", () => {
    const wonPiles: Pile[] = [];
    for (let i = 1; i <= 7; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "completed", kind: "foundation", cards: [] });
    for (let fi = 1; fi <= 4; fi++) {
      wonPiles.push({ id: `f${fi}`, kind: "foundation", cards: [] });
    }
    const wonState = { piles: wonPiles, score: 300, movesMade: 50, completedSuits: 4, won: true, settings };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(300);
  });

  it("canMove rejects foundation moves on Spiderette tableau", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 2 }], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "f1", count: 1 }, spideretteRuleset)).toBe(false);
  });
});
