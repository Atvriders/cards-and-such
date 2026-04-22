import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, diplomatRuleset } from "./state.js";
import type { DiplomatState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Diplomat initialState", () => {
  it("has exactly 104 cards total", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("8 tableau columns of 4 cards each", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 8; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(4);
      expect(t.faceUpCount).toBe(4);
    }
  });

  it("stock has 72 cards", () => {
    const s = initialState(42, settings);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(72);
  });

  it("is deterministic", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.piles.flatMap((p) => p.cards.map((c) => c.id)))
      .toEqual(s2.piles.flatMap((p) => p.cards.map((c) => c.id)));
  });
});

describe("Diplomat ruleset", () => {
  it("allows cross-suit descending tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♥", rank: 8 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 7 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, diplomatRuleset)).toBe(true);
  });

  it("rejects non-descending tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♥", rank: 5 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 7 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, diplomatRuleset)).toBe(false);
  });

  it("allows move to empty column", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t2", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 9 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, diplomatRuleset)).toBe(true);
  });
});

describe("Diplomat reducer", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("draw on empty stock is rejected", () => {
    const s = initialState(42, settings);
    const empty: DiplomatState = {
      ...s,
      piles: s.piles.map((p) => p.id === "stock" ? { ...p, cards: [] } : p),
    };
    expect(reducer(empty, { type: "draw" })).toBe(empty);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t1", count: 1 });
    expect(next).toBe(s);
  });

  it("scoring: +10 per card to foundation", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "a1", suit: "♠", rank: 1 }], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
      { id: "f5", kind: "foundation", cards: [] },
      { id: "f6", kind: "foundation", cards: [] },
      { id: "f7", kind: "foundation", cards: [] },
      { id: "f8", kind: "foundation", cards: [] },
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "waste", kind: "waste", cards: [] },
      ...Array.from({ length: 7 }, (_, i) => ({ id: `t${i+2}`, kind: "tableau" as const, cards: [], faceUpCount: 0 })),
    ];
    const s: DiplomatState = { piles, score: 0, movesMade: 0, won: false, settings };
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "f1", count: 1 });
    expect(next.score).toBe(10);
  });
});

describe("Diplomat isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when 104 cards on foundations", () => {
    const wonPiles: Pile[] = [
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "waste", kind: "waste", cards: [] },
    ];
    let idx = 0;
    for (let fi = 1; fi <= 8; fi++) {
      const suit = SUITS[(fi - 1) % 4]!;
      wonPiles.push({
        id: `f${fi}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `w${idx++}` })),
      });
    }
    for (let i = 1; i <= 8; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: DiplomatState = { piles: wonPiles, score: 500, movesMade: 200, won: true, settings };
    expect(isTerminal(wonState)).toEqual({ score: 500 });
  });
});
