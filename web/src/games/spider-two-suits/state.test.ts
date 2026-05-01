import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SpiderTwoSuitsState, SpiderTwoSuitsSettings } from "./state.js";

const S: SpiderTwoSuitsSettings = {};

describe("Spider Two Suits initialState", () => {
  it("has 104 cards (4 decks of spades + hearts)", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(104);
  });

  it("uses only spades and hearts", () => {
    const s = initialState(7, S);
    let other = 0;
    for (const p of s.piles) for (const c of p.cards) if (c.suit !== "♠" && c.suit !== "♥") other++;
    expect(other).toBe(0);
  });

  it("10 columns, first 4 with 6 cards, last 6 with 5", () => {
    const s = initialState(1, S);
    for (let i = 1; i <= 10; i++) {
      const p = s.piles.find((pp) => pp.id === `t${i}`)!;
      expect(p.cards.length).toBe(i <= 4 ? 6 : 5);
    }
  });

  it("stock holds remaining 50", () => {
    expect(initialState(1, S).piles.find((p) => p.id === "stock")!.cards.length).toBe(50);
  });
});

describe("Spider Two Suits reducer", () => {
  it("deal-row distributes cards", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "deal-row" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(40);
  });
});

describe("Spider Two Suits isTerminal", () => {
  it("returns null until 8 suits complete", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score on win", () => {
    const s = initialState(42, S);
    const won: SpiderTwoSuitsState = { ...s, completedSuits: 8, won: true, score: 460, movesMade: 130 };
    expect(isTerminal(won)!.score).toBe(460);
  });
});
