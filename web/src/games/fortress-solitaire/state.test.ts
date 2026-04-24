import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("Fortress initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(1);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42);
    const s2 = initialState(42);
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

  it("has 10 column piles and 4 foundation piles", () => {
    const s = initialState(5);
    const columns = s.piles.filter((p) => p.kind === "tableau");
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    expect(columns.length).toBe(10);
    expect(foundations.length).toBe(4);
  });
});

describe("Fortress reducer", () => {
  it("illegal move leaves state unchanged", () => {
    const s = initialState(42);
    const before = s.piles.map((p) => p.cards.length);
    // Try moving between two columns that are very likely not adjacent in suit
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "c2", count: 2 });
    // count=2 should be rejected (only single card moves)
    const after = next.piles.map((p) => p.cards.length);
    expect(before).toEqual(after);
  });

  it("auto-move does not increase card count", () => {
    const s = initialState(7);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalAfter).toBe(total);
  });
});

describe("Fortress isTerminal", () => {
  it("returns null when foundations are not full", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all foundations hold 13 cards", () => {
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
    for (let i = 1; i <= 10; i++) {
      wonPiles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState = { piles: wonPiles, movesMade: 50, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });

  it("score is non-negative", () => {
    const s = initialState(1);
    // Won state with many moves
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
    for (let i = 1; i <= 10; i++) {
      wonPiles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState = { piles: wonPiles, movesMade: 9999, won: true };
    const result = isTerminal(wonState);
    expect(result!.score).toBeGreaterThanOrEqual(0);
    void s;
  });
});
