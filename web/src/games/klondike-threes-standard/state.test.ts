import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KlondikeThreesStandardState, KlondikeThreesStandardSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: KlondikeThreesStandardSettings = {};

describe("Klondike Threes (Standard) initialState", () => {
  it("has 52 cards across all piles", () => {
    const s = initialState(42, S);
    expect(s.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("standard tableau (1..7) sizes with one face-up", () => {
    const s = initialState(7, S);
    for (let i = 1; i <= 7; i++) {
      const p = s.piles.find((pp) => pp.id === `t${i}`)!;
      expect(p.cards.length).toBe(i);
      expect(p.faceUpCount).toBe(1);
    }
  });
});

describe("Klondike Threes (Standard) draw", () => {
  it("draw flips up to 3 cards from stock to waste", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(3);
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(21);
  });

  it("recycle returns waste to stock when stock is empty (unlimited redeals)", () => {
    let cur = initialState(42, S);
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const wasteLen = cur.piles.find((p) => p.id === "waste")!.cards.length;
    const recycled = reducer(cur, { type: "recycle" });
    expect(recycled.piles.find((p) => p.id === "stock")!.cards.length).toBe(wasteLen);
    expect(recycled.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });

  it("draw on empty stock is a no-op", () => {
    let cur = initialState(42, S);
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const next = reducer(cur, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
  });
});

describe("Klondike Threes (Standard) isTerminal", () => {
  it("returns null at start", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score when 52 on foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `k3s${idx++}` })),
      });
    }
    for (let i = 1; i <= 7; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    const won: KlondikeThreesStandardState = { piles, score: 280, movesMade: 80, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(280);
  });
});
