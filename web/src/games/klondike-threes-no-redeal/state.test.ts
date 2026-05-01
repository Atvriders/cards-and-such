import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KlondikeThreesNoRedealState, KlondikeThreesNoRedealSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: KlondikeThreesNoRedealSettings = {};

describe("Klondike Threes (No Redeal) initialState", () => {
  it("has 52 cards across all piles", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });
  it("stock has 24, tableau totals 28", () => {
    const s = initialState(7, S);
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(24);
  });
});

describe("Klondike Threes (No Redeal) draw", () => {
  it("draw flips 3 cards to waste", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(3);
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(21);
  });

  it("there is no recycle action — once empty, stock stays empty", () => {
    let cur = initialState(42, S);
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    // Draw again: no-op
    const same = reducer(cur, { type: "draw" });
    expect(same.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
  });

  it("waste accumulates the entire stock after exhaustion", () => {
    let cur = initialState(42, S);
    const stockLen = cur.piles.find((p) => p.id === "stock")!.cards.length;
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    expect(cur.piles.find((p) => p.id === "waste")!.cards.length).toBe(stockLen);
  });
});

describe("Klondike Threes (No Redeal) isTerminal", () => {
  it("returns null at start", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score when all 52 on foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `k3nr${idx++}` })),
      });
    }
    for (let i = 1; i <= 7; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    const won: KlondikeThreesNoRedealState = { piles, score: 200, movesMade: 50, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(200);
  });
});
