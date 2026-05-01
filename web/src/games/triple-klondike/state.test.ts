import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TripleKlondikeState, TripleKlondikeSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: TripleKlondikeSettings = {};

describe("Triple Klondike initialState", () => {
  it("uses three decks (156 cards total)", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(156);
  });

  it("has 13 tableau columns of sizes 1..13", () => {
    const s = initialState(7, S);
    for (let i = 1; i <= 13; i++) {
      const p = s.piles.find((pp) => pp.id === `t${i}`)!;
      expect(p.cards.length).toBe(i);
      expect(p.faceUpCount).toBe(1);
    }
  });

  it("has 12 foundation piles", () => {
    const s = initialState(1, S);
    expect(s.piles.filter((p) => p.kind === "foundation").length).toBe(12);
  });

  it("stock holds 156 - 91 = 65 cards", () => {
    expect(initialState(1, S).piles.find((p) => p.id === "stock")!.cards.length).toBe(65);
  });
});

describe("Triple Klondike actions", () => {
  it("draw flips one card to waste", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("recycle returns waste to stock when stock empty", () => {
    let cur = initialState(42, S);
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const wasteLen = cur.piles.find((p) => p.id === "waste")!.cards.length;
    const r = reducer(cur, { type: "recycle" });
    expect(r.piles.find((p) => p.id === "stock")!.cards.length).toBe(wasteLen);
    expect(r.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });
});

describe("Triple Klondike isTerminal", () => {
  it("requires 156 cards on foundations", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score when all 156 on foundations (12 piles × 13)", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 12; fi++) {
      const suit = SUITS[fi % 4]! as Suit;
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit, rank: r as Rank, id: `tk${idx++}` })),
      });
    }
    for (let i = 1; i <= 13; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    const won: TripleKlondikeState = { piles, score: 1560, movesMade: 300, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(1560);
  });
});
