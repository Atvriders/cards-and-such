import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("Canfield Storehouse initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(1);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("foundations start with the four 2s", () => {
    const s = initialState(42);
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    for (const f of foundations) {
      expect(f.cards.length).toBe(1);
      expect(f.cards[0]!.rank).toBe(2);
    }
  });

  it("storehouse has 13 cards all face-up", () => {
    const s = initialState(5);
    const storehouse = s.piles.filter((p) => p.kind === "freecell");
    expect(storehouse.length).toBe(13);
    for (const cell of storehouse) {
      expect(cell.cards.length).toBe(1);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });
});

describe("Canfield Storehouse reducer", () => {
  it("draw moves cards from stock to waste", () => {
    const s = initialState(42);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    if (stockBefore === 0) return;
    const next = reducer(s, { type: "draw" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    const wasteAfter = next.piles.find((p) => p.id === "waste")!.cards.length;
    expect(stockAfter).toBeLessThan(stockBefore);
    expect(wasteAfter).toBeGreaterThan(0);
  });

  it("auto-move preserves total card count", () => {
    const s = initialState(7);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalAfter).toBe(total);
  });
});

describe("Canfield Storehouse isTerminal", () => {
  it("returns null on initial state", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when foundations hold 52 cards total", () => {
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
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
    for (let i = 1; i <= 13; i++) wonPiles.push({ id: `s${i}`, kind: "freecell", cards: [] });
    for (let i = 1; i <= 4; i++) wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    const wonState = { piles: wonPiles, score: 480, movesMade: 100, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(480);
  });
});
