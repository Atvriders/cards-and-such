import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("Corners initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(1);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("each corner pile has 3 cards", () => {
    const s = initialState(5);
    for (const id of ["cr1", "cr2", "cr3", "cr4"]) {
      const pile = s.piles.find((p) => p.id === id)!;
      expect(pile.cards.length).toBe(3);
    }
  });

  it("stock has 40 cards", () => {
    const s = initialState(5);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(40);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(77);
    const s2 = initialState(77);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });
});

describe("Corners reducer", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(42);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    const wasteAfter = next.piles.find((p) => p.id === "waste")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 1);
    expect(wasteAfter).toBe(1);
  });

  it("recycle restores waste to stock", () => {
    let s = initialState(42);
    const stockLen = s.piles.find((p) => p.id === "stock")!.cards.length;
    for (let i = 0; i < stockLen; i++) {
      s = reducer(s, { type: "draw" });
    }
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
    const recycled = reducer(s, { type: "recycle" });
    expect(recycled.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockLen);
    expect(recycled.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });

  it("auto-move preserves total card count", () => {
    const s = initialState(10);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalAfter).toBe(total);
  });
});

describe("Corners isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score when all foundations full", () => {
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
    for (const id of ["cr1", "cr2", "cr3", "cr4"]) {
      wonPiles.push({ id, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
    const wonState = { piles: wonPiles, movesMade: 80, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
