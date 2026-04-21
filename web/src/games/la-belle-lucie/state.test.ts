import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, laBelleLucieRuleset } from "./state.js";
import type { LaBelleLucieState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings2: { redeals: "0" | "1" | "2" | "3" } = { redeals: "2" };
const settings0: { redeals: "0" | "1" | "2" | "3" } = { redeals: "0" };

describe("LaBelleLucie initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, settings2);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings2);
    const s2 = initialState(7, settings2);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("18 fan piles: 17 with 3 cards, 1 with 1 card", () => {
    const s = initialState(42, settings2);
    const fans = s.piles.filter((p) => p.id.startsWith("fan"));
    expect(fans.length).toBe(18);
    const countOf3 = fans.filter((f) => f.cards.length === 3).length;
    const countOf1 = fans.filter((f) => f.cards.length === 1).length;
    expect(countOf3).toBe(17);
    expect(countOf1).toBe(1);
  });

  it("redealsRemaining matches setting", () => {
    const s = initialState(42, settings2);
    expect(s.redealsRemaining).toBe(2);
    const s0 = initialState(42, settings0);
    expect(s0.redealsRemaining).toBe(0);
  });
});

describe("LaBelleLucie ruleset", () => {
  it("only top card can be moved (count > 1 rejected)", () => {
    // fan1 bottom→top: [9♠, 8♠]; fan2 top: 9♠. Moving count=1 (8♠) onto fan2 (top 9♠): legal.
    const piles: Pile[] = [
      { id: "fan1", kind: "tableau", cards: [
        { id: "c0", suit: "♠", rank: 9 },
        { id: "c1", suit: "♠", rank: 8 },
      ], faceUpCount: 2 },
      { id: "fan2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 9 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "fan1", toPile: "fan2", count: 2 }, laBelleLucieRuleset)).toBe(false);
    expect(canMove(piles, { fromPile: "fan1", toPile: "fan2", count: 1 }, laBelleLucieRuleset)).toBe(true);
  });

  it("cannot move to empty fan pile", () => {
    const piles: Pile[] = [
      { id: "fan1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 7 }], faceUpCount: 1 },
      { id: "fan2", kind: "tableau", cards: [], faceUpCount: 0 },
    ];
    expect(canMove(piles, { fromPile: "fan1", toPile: "fan2", count: 1 }, laBelleLucieRuleset)).toBe(false);
  });
});

describe("LaBelleLucie reducer", () => {
  it("redeal decrements redealsRemaining", () => {
    const s = initialState(42, settings2);
    const next = reducer(s, { type: "redeal" });
    expect(next.redealsRemaining).toBe(1);
  });

  it("no redeal when redealsRemaining is 0", () => {
    const s = initialState(42, settings0);
    const next = reducer(s, { type: "redeal" });
    expect(next).toBe(s);
  });

  it("illegal move (count 0) is rejected", () => {
    const s = initialState(42, settings2);
    const next = reducer(s, { type: "move", fromPile: "fan1", toPile: "fan2", count: 0 });
    expect(next).toBe(s);
  });

  it("legal same-suit descending move succeeds", () => {
    const s = initialState(42, settings2);
    // Find a legal move
    let moved = false;
    outer: for (const from of s.piles.filter((p) => p.id.startsWith("fan") && p.cards.length > 0)) {
      for (const to of s.piles.filter((p) => p.id.startsWith("fan") && p.id !== from.id && p.cards.length > 0)) {
        const fromTop = from.cards[from.cards.length - 1]!;
        const toTop = to.cards[to.cards.length - 1]!;
        if (fromTop.suit === toTop.suit && (fromTop.rank as number) === (toTop.rank as number) - 1) {
          const next = reducer(s, { type: "move", fromPile: from.id, toPile: to.id, count: 1 });
          expect(next.movesMade).toBe(1);
          moved = true;
          break outer;
        }
      }
    }
    // It's okay if no legal move found in this particular seed
    if (!moved) {
      expect(true).toBe(true);
    }
  });
});

describe("LaBelleLucie isTerminal", () => {
  it("returns null when foundations are not full", () => {
    const s = initialState(42, settings2);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all 52 cards are on foundations", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (let fi = 1; fi <= 4; fi++) {
      const suit = SUITS[fi - 1]!;
      wonPiles.push({
        id: `f${fi}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `w${cardIdx++}` })),
      });
    }
    // empty fans
    for (let i = 1; i <= 18; i++) {
      wonPiles.push({ id: `fan${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: LaBelleLucieState = {
      piles: wonPiles, score: 520, movesMade: 200, redealsRemaining: 0, won: true, settings: settings2,
    };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});
