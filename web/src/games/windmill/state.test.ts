import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { WindmillState } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

describe("Windmill initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).toEqual(ids2);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1);
    const s2 = initialState(2);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).not.toEqual(ids2);
  });

  it("has 4 sail columns of 3 face-up cards each", () => {
    const s = initialState(42);
    for (let i = 1; i <= 4; i++) {
      const sail = s.piles.find((p) => p.id === `s${i}`)!;
      expect(sail.cards.length).toBe(3);
      expect(sail.faceUpCount).toBe(3);
    }
  });

  it("4 corner foundations start empty", () => {
    const s = initialState(42);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
    }
  });

  it("reserve starts empty", () => {
    const s = initialState(5);
    const reserve = s.piles.find((p) => p.id === "reserve")!;
    expect(reserve.cards.length).toBe(0);
  });

  it("stock has 40 cards (52 - 12 dealt to sails)", () => {
    const s = initialState(42);
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(40);
  });
});

describe("Windmill reducer", () => {
  it("draw moves a card from stock to waste", () => {
    const s = initialState(42);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42);
    // Try to move count=2 — illegal (only count=1 allowed)
    const next = reducer(s, { type: "move", fromPile: "s1", toPile: "f1", count: 2 });
    expect(next).toBe(s);
  });

  it("draw on empty stock recycles waste", () => {
    const s = initialState(42);
    let cur = s;
    const stockLen = cur.piles.find((p) => p.id === "stock")!.cards.length;
    for (let i = 0; i < stockLen; i++) {
      cur = reducer(cur, { type: "draw" });
    }
    expect(cur.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
    const wasteLen = cur.piles.find((p) => p.id === "waste")!.cards.length;
    const recycled = reducer(cur, { type: "draw" });
    expect(recycled.piles.find((p) => p.id === "stock")!.cards.length).toBe(wasteLen);
    expect(recycled.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });

  it("total cards never changes after a move", () => {
    const s = initialState(42);
    const before = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "draw" });
    const after = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(after).toBe(before);
  });

  it("ace placed on empty foundation is accepted", () => {
    const piles: Pile[] = [
      { id: "s1", kind: "tableau", cards: [{ suit: "♠", rank: 1, id: "as" }], faceUpCount: 1 },
      { id: "s2", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "s3", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "s4", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "stock", kind: "stock", cards: [] },
      { id: "waste", kind: "waste", cards: [] },
      { id: "reserve", kind: "freecell", cards: [] },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ];
    const s: WindmillState = { piles, score: 0, movesMade: 0, won: false };
    const next = reducer(s, { type: "move", fromPile: "s1", toPile: "f1", count: 1 });
    expect(next).not.toBe(s);
    expect(next.piles.find((p) => p.id === "f1")!.cards.length).toBe(1);
    expect(next.score).toBe(10);
  });
});

describe("Windmill isTerminal", () => {
  it("returns null when not complete", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all 4 foundations hold 13 cards each (52 total)", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `w${idx++}` })),
      });
    }
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    piles.push({ id: "reserve", kind: "freecell", cards: [] });
    for (let i = 1; i <= 4; i++) piles.push({ id: `s${i}`, kind: "tableau", cards: [], faceUpCount: 0 });

    const wonState: WindmillState = { piles, score: 200, movesMade: 50, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(200);
  });

  it("returns null with only 3 complete foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: fi < 3
          ? RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `w${idx++}` }))
          : [],
      });
    }
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    piles.push({ id: "reserve", kind: "freecell", cards: [] });
    for (let i = 1; i <= 4; i++) piles.push({ id: `s${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    const s: WindmillState = { piles, score: 0, movesMade: 0, won: false };
    expect(isTerminal(s)).toBeNull();
  });
});
