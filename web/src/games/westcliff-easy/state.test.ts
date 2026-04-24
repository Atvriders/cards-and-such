import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("WestcliffEasy initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("has 10 tableau columns of 3 cards each", () => {
    const s = initialState(7);
    for (let i = 1; i <= 10; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(3);
      expect(t.faceUpCount).toBe(1);
    }
  });

  it("stock has 22 cards", () => {
    const s = initialState(7);
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(22);
  });

  it("waste starts empty", () => {
    const s = initialState(7);
    expect(s.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });

  it("foundations start empty", () => {
    const s = initialState(7);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
    }
  });
});

describe("WestcliffEasy reducer", () => {
  it("draw moves top stock card to waste", () => {
    const s = initialState(42);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
    expect(next.movesMade).toBe(1);
  });

  it("draw when stock empty returns same state", () => {
    let s = initialState(42);
    // Empty the stock
    for (let i = 0; i < 22; i++) {
      s = reducer(s, { type: "draw" });
    }
    const next = reducer(s, { type: "draw" });
    expect(next).toBe(s);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });

  it("total cards conserved after draws", () => {
    let s = initialState(42);
    s = reducer(s, { type: "draw" });
    s = reducer(s, { type: "draw" });
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });
});

describe("WestcliffEasy isTerminal", () => {
  it("returns null initially", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score on win", () => {
    const wonPiles: Pile[] = [];
    let idx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${idx++}-${suit}${rank}` })),
      });
    }
    for (let i = 1; i <= 10; i++) wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "stock", kind: "stock", cards: [] });
    wonPiles.push({ id: "waste", kind: "waste", cards: [] });
    const won = { piles: wonPiles, score: 52, movesMade: 30, won: true };
    expect(isTerminal(won)).toEqual({ score: 52 });
  });
});
