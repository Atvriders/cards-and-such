import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cruelRuleset } from "./state.js";
import type { CruelState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Cruel initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("foundations start with 4 Aces", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 4; i++) {
      const f = s.piles.find((p) => p.id === `f${i}`)!;
      expect(f.cards.length).toBe(1);
      expect(f.cards[0]!.rank).toBe(1);
    }
  });

  it("12 tableau piles of 4 cards each", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 12; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(4);
      expect(t.faceUpCount).toBe(4);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });
});

describe("Cruel ruleset", () => {
  it("rejects empty-column fills", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t2", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 5 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, cruelRuleset)).toBe(false);
  });

  it("rejects cross-suit tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♥", rank: 7 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 6 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, cruelRuleset)).toBe(false);
  });

  it("allows same-suit descending tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 7 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 6 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, cruelRuleset)).toBe(true);
  });

  it("rejects moving 2 cards", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 8 }], faceUpCount: 1 },
      {
        id: "t2", kind: "tableau",
        cards: [{ id: "c2", suit: "♠", rank: 7 }, { id: "c3", suit: "♠", rank: 6 }],
        faceUpCount: 2,
      },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 2 }, cruelRuleset)).toBe(false);
  });
});

describe("Cruel reducer", () => {
  it("legal move updates piles and increments movesMade", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 7 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 6 }], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [{ id: "fa", suit: "♠", rank: 1 }] },
      { id: "f2", kind: "foundation", cards: [{ id: "fb", suit: "♥", rank: 1 }] },
      { id: "f3", kind: "foundation", cards: [{ id: "fc", suit: "♦", rank: 1 }] },
      { id: "f4", kind: "foundation", cards: [{ id: "fd", suit: "♣", rank: 1 }] },
    ];
    const s: CruelState = { piles, score: 0, movesMade: 0, won: false, settings };
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next.movesMade).toBe(1);
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(2);
    expect(next.piles.find((p) => p.id === "t2")!.cards.length).toBe(0);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42, settings);
    const before = s.movesMade;
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t1", count: 1 });
    expect(next.movesMade).toBe(before);
  });
});

describe("Cruel isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when all 52 cards on foundations", () => {
    const wonPiles: Pile[] = [];
    let idx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `w${idx++}` })),
      });
    }
    for (let i = 1; i <= 12; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: CruelState = { piles: wonPiles, score: 480, movesMade: 100, won: true, settings };
    expect(isTerminal(wonState)).toEqual({ score: 480 });
  });
});
