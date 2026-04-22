import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, congressRuleset } from "./state.js";
import type { CongressState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Congress initialState", () => {
  it("has exactly 104 cards total", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("8 reserve slots each with 1 card", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 8; i++) {
      const r = s.piles.find((p) => p.id === `r${i}`)!;
      expect(r.cards.length).toBe(1);
      expect(r.kind).toBe("freecell");
    }
  });

  it("4 tableau columns of 8 cards each", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 4; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(8);
    }
  });

  it("8 empty foundations", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 8; i++) {
      const f = s.piles.find((p) => p.id === `f${i}`)!;
      expect(f.cards.length).toBe(0);
    }
  });
});

describe("Congress ruleset", () => {
  it("allows cross-suit descending tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♥", rank: 9 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 8 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, congressRuleset)).toBe(true);
  });

  it("rejects placing more than 1 card in reserve", () => {
    const piles: Pile[] = [
      { id: "r1", kind: "freecell", cards: [] },
      {
        id: "t1", kind: "tableau",
        cards: [{ id: "c1", suit: "♠", rank: 5 }, { id: "c2", suit: "♥", rank: 4 }],
        faceUpCount: 2,
      },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "r1", count: 2 }, congressRuleset)).toBe(false);
  });

  it("allows placing 1 card in empty reserve", () => {
    const piles: Pile[] = [
      { id: "r1", kind: "freecell", cards: [] },
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 7 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "r1", count: 1 }, congressRuleset)).toBe(true);
  });

  it("rejects placing card in occupied reserve", () => {
    const piles: Pile[] = [
      { id: "r1", kind: "freecell", cards: [{ id: "x", suit: "♥", rank: 3 }] },
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 7 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "r1", count: 1 }, congressRuleset)).toBe(false);
  });
});

describe("Congress reducer", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("draw on empty stock is rejected", () => {
    const s = initialState(42, settings);
    const empty: CongressState = {
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
});

describe("Congress isTerminal", () => {
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
    for (let i = 1; i <= 8; i++) wonPiles.push({ id: `r${i}`, kind: "freecell", cards: [] });
    for (let i = 1; i <= 4; i++) wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    const wonState: CongressState = { piles: wonPiles, score: 300, movesMade: 100, won: true, settings };
    expect(isTerminal(wonState)).toEqual({ score: 300 });
  });
});
