import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, pounceRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

const settings = {};

describe("Pounce initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("pounce pile has 13 cards with 1 face-up", () => {
    const s = initialState(1, settings);
    const pounce = s.piles.find((p) => p.id === "pounce")!;
    expect(pounce.cards.length).toBe(13);
    expect(pounce.faceUpCount).toBe(1);
  });

  it("stock has 39 cards", () => {
    const s = initialState(1, settings);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(39);
  });

  it("foundations start empty", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
    }
  });
});

describe("Pounce ruleset", () => {
  it("foundation accepts Ace on empty pile", () => {
    const target: Pile = { id: "f1", kind: "foundation", cards: [] };
    expect(pounceRuleset.canStack(target, [{ id: "a", suit: "♠", rank: 1 }])).toBe(true);
  });

  it("foundation accepts same-suit ascending card", () => {
    const target: Pile = { id: "f1", kind: "foundation", cards: [{ id: "a", suit: "♥", rank: 5 }] };
    expect(pounceRuleset.canStack(target, [{ id: "b", suit: "♥", rank: 6 }])).toBe(true);
  });

  it("foundation rejects wrong suit", () => {
    const target: Pile = { id: "f1", kind: "foundation", cards: [{ id: "a", suit: "♥", rank: 5 }] };
    expect(pounceRuleset.canStack(target, [{ id: "b", suit: "♠", rank: 6 }])).toBe(false);
  });

  it("multi-card pickup rejected", () => {
    const pile: Pile = { id: "waste", kind: "waste", cards: [{ id: "a", suit: "♠", rank: 3 }] };
    expect(pounceRuleset.canPickUp(pile, 2)).toBe(false);
  });
});

describe("Pounce reducer", () => {
  it("draw moves up to 3 cards to waste", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "draw" });
    const waste = next.piles.find((p) => p.id === "waste")!;
    expect(waste.cards.length).toBe(3);
  });

  it("recycle moves waste back to stock", () => {
    const s = initialState(42, settings);
    // Exhaust stock by drawing repeatedly
    let cur = s;
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const next = reducer(cur, { type: "recycle" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBeGreaterThan(0);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });

  it("won state is immutable", () => {
    const s = { ...initialState(1, settings), won: true };
    expect(reducer(s, { type: "draw" })).toBe(s);
  });

  it("total cards preserved after draw", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "draw" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });
});

describe("Pounce isTerminal", () => {
  it("returns null initially", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when won", () => {
    // Build a state with all foundations full
    const wonPiles: Pile[] = [];
    let idx = 0;
    for (let i = 1; i <= 4; i++) {
      const suit = SUITS[i - 1]!;
      wonPiles.push({
        id: `f${i}`, kind: "foundation",
        cards: RANKS.map((r) => ({ suit: suit as Suit, rank: r as Rank, id: `${idx++}` })),
      });
    }
    wonPiles.push({ id: "pounce", kind: "tableau", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "stock", kind: "stock", cards: [] });
    wonPiles.push({ id: "waste", kind: "waste", cards: [] });
    const s = { piles: wonPiles, score: 520, movesMade: 52, won: true, settings };
    expect(isTerminal(s)).toEqual({ score: 520 });
  });
});
