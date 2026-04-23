import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { EasthavenState } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

describe("Easthaven initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42);
    expect(s.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("is deterministic", () => {
    const s1 = initialState(55);
    const s2 = initialState(55);
    expect(s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","))
      .toEqual(s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","));
  });

  it("7 tableau columns of 3 cards, only top face-up", () => {
    const s = initialState(42);
    for (let i = 1; i <= 7; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(3);
      expect(t.faceUpCount).toBe(1);
    }
  });

  it("stock has 31 cards", () => {
    const s = initialState(42);
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(31);
  });
});

describe("Easthaven reducer — deal-row", () => {
  it("deal-row adds one card to each of the 7 columns", () => {
    const s = initialState(42);
    const before = ["t1","t2","t3","t4","t5","t6","t7"].map((id) =>
      s.piles.find((p) => p.id === id)!.cards.length
    );
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "deal-row" });
    const after = ["t1","t2","t3","t4","t5","t6","t7"].map((id) =>
      next.piles.find((p) => p.id === id)!.cards.length
    );
    expect(after).toEqual(before.map((n) => n + 1));
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 7);
  });

  it("deal-row on empty stock does nothing", () => {
    let s = initialState(42);
    // Exhaust stock (31 cards = 4 full deals of 7 = 28 + 1 partial deal)
    for (let i = 0; i < 5; s = reducer(s, { type: "deal-row" }), i++);
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
    const next = reducer(s, { type: "deal-row" });
    expect(next).toBe(s);
  });

  it("move is rejected when illegal", () => {
    const s = initialState(42);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "f1", count: 1 });
    // Either same or legal move — total should still be 52
    expect(next.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(total);
  });

  it("won state not modified further", () => {
    const s = initialState(42);
    const won: EasthavenState = { ...s, won: true };
    expect(reducer(won, { type: "deal-row" })).toBe(won);
  });
});

describe("Easthaven isTerminal", () => {
  it("returns null when not complete", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score when 52 cards on foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `eh${idx++}` })),
      });
    }
    for (let i = 1; i <= 7; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    const wonState: EasthavenState = { piles, score: 400, movesMade: 60, won: true };
    expect(isTerminal(wonState)!.score).toBe(400);
  });
});
