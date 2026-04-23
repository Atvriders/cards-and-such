import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FlowerGardenState } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

describe("Flower Garden initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42);
    expect(s.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("is deterministic", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","))
      .toEqual(s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","));
  });

  it("6 bouquet columns of 6 cards each, all face-up", () => {
    const s = initialState(42);
    for (let i = 1; i <= 6; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(6);
      expect(t.faceUpCount).toBe(6);
    }
  });

  it("garden reserve has 16 cards", () => {
    const s = initialState(42);
    expect(s.piles.find((p) => p.id === "garden")!.cards.length).toBe(16);
  });
});

describe("Flower Garden reducer", () => {
  it("move from garden to foundation works when top card is Ace", () => {
    const piles: Pile[] = [
      { id: "garden", kind: "stock", cards: [{ suit: "♠", rank: 1, id: "as" }] },
      { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t2", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t4", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t5", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t6", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ];
    const s: FlowerGardenState = { piles, score: 0, movesMade: 0, won: false };
    const next = reducer(s, { type: "move", fromPile: "garden", toPile: "f1", count: 1 });
    expect(next.piles.find((p) => p.id === "f1")!.cards.length).toBe(1);
    expect(next.piles.find((p) => p.id === "garden")!.cards.length).toBe(0);
    expect(next.score).toBe(10);
  });

  it("tableau same-suit build allowed (any-suit rule)", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ suit: "♥", rank: 8, id: "8h" }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ suit: "♥", rank: 7, id: "7h" }], faceUpCount: 1 },
      { id: "garden", kind: "stock", cards: [] },
      { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t4", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t5", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t6", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ];
    const s: FlowerGardenState = { piles, score: 0, movesMade: 0, won: false };
    // 7♥ onto 8♥ — same suit, rank-1 lower — allowed in Flower Garden
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next).not.toBe(s);
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(2);
  });

  it("multi-card move is rejected (count > 1 from tableau)", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 2 });
    // Should be rejected since count > 1
    expect(next.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("won state is not modified", () => {
    const s = initialState(42);
    const wonState: FlowerGardenState = { ...s, won: true };
    const next = reducer(wonState, { type: "move", fromPile: "t1", toPile: "f1", count: 1 });
    expect(next).toBe(wonState);
  });
});

describe("Flower Garden isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score when all 52 cards on foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `fg${idx++}` })),
      });
    }
    for (let i = 1; i <= 6; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "garden", kind: "stock", cards: [] });
    const wonState: FlowerGardenState = { piles, score: 520, movesMade: 52, won: true };
    expect(isTerminal(wonState)!.score).toBe(520);
  });
});
