import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KlondikeNoRedealState, KlondikeNoRedealSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: KlondikeNoRedealSettings = {};

describe("Klondike (No Redeal) initialState", () => {
  it("has 52 cards across all piles", () => {
    const s = initialState(42, S);
    expect(s.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("tableau columns are sized 1..7 with one face-up", () => {
    const s = initialState(7, S);
    for (let i = 1; i <= 7; i++) {
      const p = s.piles.find((pp) => pp.id === `t${i}`)!;
      expect(p.cards.length).toBe(i);
      expect(p.faceUpCount).toBe(1);
    }
  });

  it("stock holds the remaining 24 cards", () => {
    const s = initialState(1, S);
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(24);
  });
});

describe("Klondike (No Redeal) draw", () => {
  it("draw moves one card to waste", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(23);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("does not recycle waste — there is no recycle action", () => {
    let cur = initialState(42, S);
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    // No "recycle" action exists; draws on empty stock are no-ops
    const same = reducer(cur, { type: "draw" });
    expect(same).toBe(cur);
    expect(same.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
  });

  it("after exhausting stock, waste keeps every card (single pass)", () => {
    let cur = initialState(42, S);
    const stockLen = cur.piles.find((p) => p.id === "stock")!.cards.length;
    for (let i = 0; i < stockLen; i++) {
      cur = reducer(cur, { type: "draw" });
    }
    expect(cur.piles.find((p) => p.id === "waste")!.cards.length).toBe(stockLen);
  });
});

describe("Klondike (No Redeal) isTerminal", () => {
  it("returns null at start", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score when all 52 cards on foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `knr${idx++}` })),
      });
    }
    for (let i = 1; i <= 7; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    const won: KlondikeNoRedealState = { piles, score: 250, movesMade: 50, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(250);
  });
});
