import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ThumbAndPouchState } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

describe("Thumb and Pouch initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    expect(s.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("is deterministic", () => {
    const s1 = initialState(77);
    const s2 = initialState(77);
    expect(s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","))
      .toEqual(s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","));
  });

  it("tableau piles have correct sizes", () => {
    const s = initialState(5);
    for (let i = 1; i <= 7; i++) {
      const pile = s.piles.find((p) => p.id === `t${i}`)!;
      expect(pile.cards.length).toBe(i);
      expect(pile.faceUpCount).toBe(1);
    }
  });

  it("stock has 24 cards", () => {
    const s = initialState(5);
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(24);
  });
});

describe("Thumb and Pouch reducer", () => {
  it("draw moves card from stock to waste", () => {
    const s = initialState(42);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("recycle on empty stock returns waste to stock", () => {
    const s = initialState(42);
    let cur = s;
    const len = cur.piles.find((p) => p.id === "stock")!.cards.length;
    for (let i = 0; i < len; i++) cur = reducer(cur, { type: "draw" });
    const wasteLen = cur.piles.find((p) => p.id === "waste")!.cards.length;
    const recycled = reducer(cur, { type: "recycle" });
    expect(recycled.piles.find((p) => p.id === "stock")!.cards.length).toBe(wasteLen);
    expect(recycled.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });

  it("same-suit stacking is rejected", () => {
    // Place two same-suit cards: 8♥ then try 7♥ — should be rejected
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ suit: "♥", rank: 8, id: "8h" }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ suit: "♥", rank: 7, id: "7h" }], faceUpCount: 1 },
      { id: "stock", kind: "stock", cards: [] },
      { id: "waste", kind: "waste", cards: [] },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ];
    const s: ThumbAndPouchState = { piles, score: 0, movesMade: 0, won: false };
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next).toBe(s);
  });

  it("different-suit same-rank-minus-one stacking is accepted", () => {
    // 8♥ and 7♣ — different suit, correct rank
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ suit: "♥", rank: 8, id: "8h" }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ suit: "♣", rank: 7, id: "7c" }], faceUpCount: 1 },
      { id: "stock", kind: "stock", cards: [] },
      { id: "waste", kind: "waste", cards: [] },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ];
    const s: ThumbAndPouchState = { piles, score: 0, movesMade: 0, won: false };
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next).not.toBe(s);
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(2);
  });
});

describe("Thumb and Pouch isTerminal", () => {
  it("returns null when game not won", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score when won", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `tp${idx++}` })),
      });
    }
    for (let i = 1; i <= 7; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    const wonState: ThumbAndPouchState = { piles, score: 520, movesMade: 52, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});
