import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("MilliganCell initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("has 12 free cells, all empty", () => {
    const s = initialState(5);
    for (let i = 1; i <= 12; i++) {
      const fc = s.piles.find((p) => p.id === `fc${i}`)!;
      expect(fc).toBeDefined();
      expect(fc.cards.length).toBe(0);
      expect(fc.kind).toBe("freecell");
    }
  });

  it("first 4 cascades have 7 cards, last 4 have 6", () => {
    const s = initialState(5);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `c${i}`)!.cards.length).toBe(7);
    }
    for (let i = 5; i <= 8; i++) {
      expect(s.piles.find((p) => p.id === `c${i}`)!.cards.length).toBe(6);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(100);
    const s2 = initialState(100);
    const flat1 = s1.piles.map((p) => p.cards.map((c) => c.id)).flat().join(",");
    const flat2 = s2.piles.map((p) => p.cards.map((c) => c.id)).flat().join(",");
    expect(flat1).toEqual(flat2);
  });
});

describe("MilliganCell reducer", () => {
  it("can move card to free cell", () => {
    const s = initialState(42);
    const c1 = s.piles.find((p) => p.id === "c1")!;
    const beforeLen = c1.cards.length;
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "fc1", count: 1 });
    expect(next.piles.find((p) => p.id === "c1")!.cards.length).toBe(beforeLen - 1);
    expect(next.piles.find((p) => p.id === "fc1")!.cards.length).toBe(1);
    expect(next.movesMade).toBe(1);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "c2", count: 0 });
    expect(next).toBe(s);
  });

  it("total cards conserved after moves", () => {
    let s = initialState(42);
    s = reducer(s, { type: "move", fromPile: "c1", toPile: "fc1", count: 1 });
    s = reducer(s, { type: "move", fromPile: "c2", toPile: "fc2", count: 1 });
    s = reducer(s, { type: "move", fromPile: "c3", toPile: "fc3", count: 1 });
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("auto-move-to-foundation does not lose cards", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });
});

describe("MilliganCell isTerminal", () => {
  it("returns null before win", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score on complete foundations", () => {
    const wonPiles: Pile[] = [];
    let idx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${idx++}-${suit}${rank}` })),
      });
    }
    for (let i = 1; i <= 8; i++) wonPiles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    for (let i = 1; i <= 12; i++) wonPiles.push({ id: `fc${i}`, kind: "freecell", cards: [] });
    const won = { piles: wonPiles, score: 50, movesMade: 2, won: true };
    expect(isTerminal(won)).toEqual({ score: 50 });
  });
});
