import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CanfieldState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

const settings = {};

describe("Canfield initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1, settings);
    const s2 = initialState(2, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).not.toEqual(ids2);
  });

  it("reserve has 13 cards, each tableau col has 1 card", () => {
    const s = initialState(5, settings);
    const reserve = s.piles.find((p) => p.id === "reserve")!;
    expect(reserve.cards.length).toBe(13);
    for (let i = 1; i <= 4; i++) {
      const tab = s.piles.find((p) => p.id === `t${i}`)!;
      expect(tab.cards.length).toBe(1);
    }
  });

  it("foundation f1 starts with one card (the base rank)", () => {
    const s = initialState(5, settings);
    const f1 = s.piles.find((p) => p.id === "f1")!;
    expect(f1.cards.length).toBe(1);
    expect(f1.cards[0]!.rank).toBe(s.foundationStartRank);
  });
});

describe("Canfield reducer", () => {
  it("draw moves cards from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    const wasteAfter = next.piles.find((p) => p.id === "waste")!.cards.length;
    expect(stockAfter).toBe(stockBefore - Math.min(3, stockBefore));
    expect(wasteAfter).toBeGreaterThan(0);
  });

  it("illegal move (0 count) is rejected", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });

  it("draw then recycle restores stock", () => {
    const s = initialState(42, settings);
    let cur = s;
    const stockLen = cur.piles.find((p) => p.id === "stock")!.cards.length;
    for (let i = 0; i < Math.ceil(stockLen / 3); i++) {
      cur = reducer(cur, { type: "draw" });
    }
    expect(cur.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
    const recycled = reducer(cur, { type: "recycle" });
    expect(recycled.piles.find((p) => p.id === "stock")!.cards.length).toBeGreaterThan(0);
  });
});

describe("Canfield isTerminal", () => {
  it("returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all 52 cards are on foundations", () => {
    const wonPiles: Pile[] = [
      { id: "reserve", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "waste", kind: "waste", cards: [] },
    ];
    let cardIdx = 0;
    for (let fi = 1; fi <= 4; fi++) {
      const suit = SUITS[fi - 1]!;
      wonPiles.push({
        id: `f${fi}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${cardIdx++}` })),
      });
    }
    for (let i = 1; i <= 4; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: CanfieldState = {
      piles: wonPiles,
      score: 260,
      movesMade: 200,
      won: true,
      foundationStartRank: 1,
      settings,
    };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(260);
  });
});
