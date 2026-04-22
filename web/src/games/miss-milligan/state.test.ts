import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, missMilliganRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank, Card } from "../../engines/deck/index.js";

const settings = {};

describe("MissMilligan initialState", () => {
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

  it("has 8 columns each with 1 card and stock with 44", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 8; i++) {
      const c = s.piles.find((p) => p.id === `c${i}`)!;
      expect(c.cards.length).toBe(1);
      expect(c.faceUpCount).toBe(1);
    }
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(44);
  });

  it("4 foundations start empty", () => {
    const s = initialState(1, settings);
    for (let fi = 1; fi <= 4; fi++) {
      expect(s.piles.find((p) => p.id === `f${fi}`)!.cards.length).toBe(0);
    }
  });
});

describe("MissMilligan ruleset", () => {
  it("alternating-color descending tableau stack is valid", () => {
    const target: Pile = {
      id: "c1", kind: "tableau",
      cards: [{ id: "a1", suit: "♠", rank: 9 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "a2", suit: "♥", rank: 8 }];
    expect(missMilliganRuleset.canStack(target, moving)).toBe(true);
  });

  it("same-color stack is invalid", () => {
    const target: Pile = {
      id: "c1", kind: "tableau",
      cards: [{ id: "a1", suit: "♠", rank: 9 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "a2", suit: "♣", rank: 8 }];
    expect(missMilliganRuleset.canStack(target, moving)).toBe(false);
  });
});

describe("MissMilligan reducer", () => {
  it("deal-column reduces stock by 8 and adds to each column", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "deal-column" });
    const stock = next.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(44 - 8);
    expect(next.movesMade).toBe(1);
  });

  it("illegal move (count 0) returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "c2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("MissMilligan isTerminal", () => {
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
    for (let i = 1; i <= 8; i++) {
      wonPiles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    const wonState = { piles: wonPiles, score: 520, movesMade: 80, won: true, settings };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});
