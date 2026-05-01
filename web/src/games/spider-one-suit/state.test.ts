import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SpiderOneSuitState, SpiderOneSuitSettings } from "./state.js";

const S: SpiderOneSuitSettings = {};

describe("Spider One Suit initialState", () => {
  it("has 104 cards (8 copies × 13 ranks)", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(104);
  });

  it("uses only spades — single-suit deck", () => {
    const s = initialState(7, S);
    let nonSpade = 0;
    for (const p of s.piles) {
      for (const c of p.cards) if (c.suit !== "♠") nonSpade += 1;
    }
    expect(nonSpade).toBe(0);
  });

  it("10 columns, first 4 with 6 cards, last 6 with 5", () => {
    const s = initialState(1, S);
    for (let i = 1; i <= 10; i++) {
      const p = s.piles.find((pp) => pp.id === `t${i}`)!;
      expect(p.cards.length).toBe(i <= 4 ? 6 : 5);
      expect(p.faceUpCount).toBe(1);
    }
  });

  it("stock holds remaining 50 cards", () => {
    expect(initialState(1, S).piles.find((p) => p.id === "stock")!.cards.length).toBe(50);
  });
});

describe("Spider One Suit reducer", () => {
  it("deal-row distributes 10 cards if no column is empty", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "deal-row" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(40);
  });

  it("deal-row blocked when stock has fewer than 10 cards", () => {
    const piles = initialState(1, S).piles.map((p) => p.id === "stock" ? { ...p, cards: p.cards.slice(0, 5) } : p);
    const trimmed: SpiderOneSuitState = { piles, score: 500, movesMade: 0, completedSuits: 0, won: false, settings: S };
    const next = reducer(trimmed, { type: "deal-row" });
    expect(next).toBe(trimmed);
  });
});

describe("Spider One Suit isTerminal", () => {
  it("returns null until all 8 suits complete", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score when 8 completed suits", () => {
    const s = initialState(42, S);
    const won: SpiderOneSuitState = { ...s, completedSuits: 8, won: true, score: 480, movesMade: 120 };
    expect(isTerminal(won)!.score).toBe(480);
  });
});
