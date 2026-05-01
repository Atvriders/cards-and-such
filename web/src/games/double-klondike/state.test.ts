import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DoubleKlondikeState, DoubleKlondikeSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: DoubleKlondikeSettings = {};

describe("Double Klondike initialState", () => {
  it("uses two decks (104 cards total)", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(104);
  });

  it("has 9 tableau columns of sizes 1..9", () => {
    const s = initialState(7, S);
    for (let i = 1; i <= 9; i++) {
      const p = s.piles.find((pp) => pp.id === `t${i}`)!;
      expect(p.cards.length).toBe(i);
      expect(p.faceUpCount).toBe(1);
    }
  });

  it("has 8 foundation piles", () => {
    const s = initialState(1, S);
    const founds = s.piles.filter((p) => p.kind === "foundation");
    expect(founds.length).toBe(8);
  });

  it("stock holds 104 - 45 = 59 cards", () => {
    expect(initialState(1, S).piles.find((p) => p.id === "stock")!.cards.length).toBe(59);
  });
});

describe("Double Klondike actions", () => {
  it("draw moves one card to waste", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("recycle returns waste to empty stock", () => {
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

describe("Double Klondike isTerminal", () => {
  it("requires 104 cards on foundations", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score when all 104 on foundations (8 piles × 13 cards)", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 8; fi++) {
      const suit = SUITS[fi % 4]! as Suit;
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit, rank: r as Rank, id: `dk${idx++}` })),
      });
    }
    for (let i = 1; i <= 9; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    const won: DoubleKlondikeState = { piles, score: 1040, movesMade: 200, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(1040);
  });
});
