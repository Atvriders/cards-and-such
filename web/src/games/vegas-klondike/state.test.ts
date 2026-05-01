import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SoliState, SoliSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: SoliSettings = {};

describe("Vegas Klondike initialState", () => {
  it("starts at -52 (52-dollar buy-in)", () => {
    expect(initialState(1, S).score).toBe(-52);
  });
  it("has 52 cards across all piles", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });
  it("stock has 24 cards", () => {
    expect(initialState(7, S).piles.find((p) => p.id === "stock")!.cards.length).toBe(24);
  });
});

describe("Vegas Klondike draw", () => {
  it("draw moves one card to waste (Vegas is draw-1, single pass)", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });
  it("after stock exhausted, no recycle (no-op)", () => {
    let cur = initialState(42, S);
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const same = reducer(cur, { type: "draw" });
    expect(same.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
  });
});

describe("Vegas Klondike scoring", () => {
  it("isTerminal returns score with full foundations (full win = +$208 = -52 + 52*5)", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `vk${idx++}` })),
      });
    }
    for (let i = 1; i <= 7; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    // -52 + 52*5 = 208
    const won: SoliState = { piles, score: 208, movesMade: 50, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(208);
  });

  it("returns null when foundations are empty", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });
});
