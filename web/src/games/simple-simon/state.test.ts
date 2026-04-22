import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, simpleSimonRuleset, isSameSuitSequence } from "./state.js";
import type { SimpleSimonState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import type { Card } from "../../engines/deck/index.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("SimpleSimon initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("10 tableau columns with correct sizes", () => {
    const s = initialState(42, settings);
    const sizes = [3, 3, 3, 3, 4, 4, 8, 8, 8, 8];
    for (let i = 0; i < 10; i++) {
      const t = s.piles.find((p) => p.id === `t${i + 1}`)!;
      expect(t.cards.length).toBe(sizes[i]);
    }
  });

  it("4 empty foundations", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 4; i++) {
      const f = s.piles.find((p) => p.id === `f${i}`)!;
      expect(f.cards.length).toBe(0);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(123, settings);
    const s2 = initialState(123, settings);
    expect(s1.piles.flatMap((p) => p.cards.map((c) => c.id)))
      .toEqual(s2.piles.flatMap((p) => p.cards.map((c) => c.id)));
  });
});

describe("isSameSuitSequence", () => {
  it("returns true for valid same-suit descending sequence", () => {
    const cards: Card[] = [
      { id: "a", suit: "♠", rank: 5 },
      { id: "b", suit: "♠", rank: 4 },
      { id: "c", suit: "♠", rank: 3 },
    ];
    expect(isSameSuitSequence(cards, 3)).toBe(true);
  });

  it("returns false for mixed-suit sequence", () => {
    const cards: Card[] = [
      { id: "a", suit: "♠", rank: 5 },
      { id: "b", suit: "♥", rank: 4 },
    ];
    expect(isSameSuitSequence(cards, 2)).toBe(false);
  });
});

describe("SimpleSimon ruleset", () => {
  it("rejects moving non-same-suit group", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♣", rank: 7 }], faceUpCount: 1 },
      {
        id: "t2", kind: "tableau",
        cards: [
          { id: "c2", suit: "♠", rank: 6 },
          { id: "c3", suit: "♥", rank: 5 },
        ],
        faceUpCount: 2,
      },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 2 }, simpleSimonRuleset)).toBe(false);
  });

  it("allows moving same-suit sequence", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 7 }], faceUpCount: 1 },
      {
        id: "t2", kind: "tableau",
        cards: [
          { id: "c2", suit: "♠", rank: 6 },
          { id: "c3", suit: "♠", rank: 5 },
        ],
        faceUpCount: 2,
      },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 2 }, simpleSimonRuleset)).toBe(true);
  });
});

describe("SimpleSimon reducer", () => {
  it("legal move increments movesMade", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 7 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 6 }], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
      ...Array.from({ length: 8 }, (_, i) => ({ id: `t${i + 3}`, kind: "tableau" as const, cards: [], faceUpCount: 0 })),
    ];
    const s: SimpleSimonState = { piles, score: 0, movesMade: 0, won: false, settings };
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next.movesMade).toBe(1);
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(2);
  });

  it("auto-removes K→A same-suit sequence after move", () => {
    // Build a pile with K→2 in spades, and another with A of spades
    const kToTwo: Card[] = RANKS.slice(1).reverse().map((rank, i) => ({
      id: `k${i}`, suit: "♠" as Suit, rank: rank as Rank,
    })); // ranks 13,12,...,2
    const ace: Card = { id: "ace", suit: "♠", rank: 1 };

    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: kToTwo, faceUpCount: kToTwo.length },
      { id: "t2", kind: "tableau", cards: [ace], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
      ...Array.from({ length: 8 }, (_, i) => ({ id: `t${i + 3}`, kind: "tableau" as const, cards: [], faceUpCount: 0 })),
    ];
    const s: SimpleSimonState = { piles, score: 0, movesMade: 0, won: false, settings };
    // Move ace onto t1 which has K→2 in spades
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    // The K→A sequence should auto-remove to foundation
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(0);
    const foundationCards = next.piles
      .filter((p) => p.kind === "foundation")
      .reduce((sum, p) => sum + p.cards.length, 0);
    expect(foundationCards).toBe(13);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t1", count: 1 });
    expect(next).toBe(s);
  });
});

describe("SimpleSimon isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when all 52 on foundations", () => {
    const wonPiles: Pile[] = [];
    let idx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `w${idx++}` })),
      });
    }
    for (let i = 1; i <= 10; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: SimpleSimonState = { piles: wonPiles, score: 400, movesMade: 80, won: true, settings };
    expect(isTerminal(wonState)).toEqual({ score: 400 });
  });
});
