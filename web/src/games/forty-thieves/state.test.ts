import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, fortyThievesRuleset } from "./state.js";
import type { FortyThievesState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("FortyThieves initialState", () => {
  it("has exactly 104 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("10 tableau columns of 4 cards each", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 10; i++) {
      const tab = s.piles.find((p) => p.id === `t${i}`)!;
      expect(tab.cards.length).toBe(4);
      expect(tab.faceUpCount).toBe(4);
    }
  });

  it("stock has 64 cards", () => {
    const s = initialState(42, settings);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(64);
  });

  it("8 empty foundations", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 8; i++) {
      const f = s.piles.find((p) => p.id === `f${i}`)!;
      expect(f.cards.length).toBe(0);
    }
  });
});

describe("FortyThieves ruleset", () => {
  it("rejects moving 2 cards from tableau", () => {
    const piles: Pile[] = [
      {
        id: "t1", kind: "tableau",
        cards: [
          { id: "c1", suit: "♠", rank: 8 },
          { id: "c2", suit: "♠", rank: 7 },
        ],
        faceUpCount: 2,
      },
      {
        id: "t2", kind: "tableau",
        cards: [{ id: "c3", suit: "♠", rank: 9 }],
        faceUpCount: 1,
      },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "t2", count: 2 }, fortyThievesRuleset)).toBe(false);
  });

  it("rejects cross-suit tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♥", rank: 7 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 8 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "t2", count: 1 }, fortyThievesRuleset)).toBe(false);
  });
});

describe("FortyThieves reducer", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("draw on empty stock is rejected", () => {
    const s = initialState(42, settings);
    const emptied = { ...s, piles: s.piles.map((p) => p.id === "stock" ? { ...p, cards: [] } : p) };
    const next = reducer(emptied, { type: "draw" });
    expect(next).toBe(emptied);
  });

  it("illegal move (count=0) is rejected", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("FortyThieves isTerminal", () => {
  it("returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all 104 cards are on foundations", () => {
    const wonPiles: Pile[] = [
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "waste", kind: "waste", cards: [] },
    ];
    let cardIdx = 0;
    for (let fi = 1; fi <= 8; fi++) {
      const suit = SUITS[(fi - 1) % 4]!;
      wonPiles.push({
        id: `f${fi}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `w${cardIdx++}` })),
      });
    }
    for (let i = 1; i <= 10; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: FortyThievesState = {
      piles: wonPiles, score: 1040, movesMade: 300, won: true, settings,
    };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(1040);
  });
});
