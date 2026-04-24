import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("Four Seasons initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(1);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("foundations each start with 1 card of the start rank", () => {
    const s = initialState(42);
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    for (const f of foundations) {
      if (f.cards.length > 0) {
        expect(f.cards[0]!.rank).toBe(s.foundationStartRank);
      }
    }
    // All 4 start rank cards should be on foundations
    const totalOnFoundations = foundations.reduce((sum, f) => sum + f.cards.length, 0);
    expect(totalOnFoundations).toBe(4);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(55);
    const s2 = initialState(55);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1);
    const s2 = initialState(2);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).not.toEqual(ids2);
  });
});

describe("Four Seasons reducer", () => {
  it("draw moves one card to waste", () => {
    const s = initialState(42);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("auto-move preserves total card count", () => {
    const s = initialState(7);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    expect(next.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(total);
  });

  it("won state is ignored (no further moves)", () => {
    const s = initialState(1);
    const wonState = { ...s, won: true };
    const next = reducer(wonState, { type: "draw" });
    expect(next).toBe(wonState);
  });
});

describe("Four Seasons isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score when all foundations hold 13 each", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({
          suit: suit as Suit,
          rank: rank as Rank,
          id: `${cardIdx++}-${suit}${rank}`,
        })),
      });
    }
    for (let i = 1; i <= 5; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
    const wonState = { piles: wonPiles, movesMade: 60, won: true, foundationStartRank: 5 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
