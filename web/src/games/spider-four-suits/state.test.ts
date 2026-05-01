import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, spiderFourSuitsRuleset } from "./state.js";
import type { SpiderFourSuitsState, SpiderFourSuitsSettings } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: SpiderFourSuitsSettings = {};

describe("Spider Four Suits initialState", () => {
  it("has 104 cards (two full decks)", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(104);
  });

  it("has all four suits", () => {
    const s = initialState(7, S);
    const suits = new Set<string>();
    for (const p of s.piles) for (const c of p.cards) suits.add(c.suit);
    expect(suits.size).toBe(4);
  });

  it("10 columns, first 4 with 6 cards, last 6 with 5", () => {
    const s = initialState(1, S);
    for (let i = 1; i <= 10; i++) {
      const p = s.piles.find((pp) => pp.id === `t${i}`)!;
      expect(p.cards.length).toBe(i <= 4 ? 6 : 5);
    }
  });
});

describe("Spider Four Suits rules", () => {
  it("only same-suit descending sequences can be picked up together", () => {
    // Top of pile is ♠5, ♠4 — pickable as 2.
    const pile: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [
        { suit: "♠", rank: 5, id: "a" },
        { suit: "♠", rank: 4, id: "b" },
      ],
      faceUpCount: 2,
    };
    expect(spiderFourSuitsRuleset.canPickUp(pile, 2)).toBe(true);

    // Mixed suits: ♥5 → ♠4 — NOT pickable
    const mixed: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [
        { suit: "♥", rank: 5, id: "x" },
        { suit: "♠", rank: 4, id: "y" },
      ],
      faceUpCount: 2,
    };
    expect(spiderFourSuitsRuleset.canPickUp(mixed, 2)).toBe(false);
  });

  it("any card can be placed on a higher rank (mixed suits OK for placement)", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ suit: "♠", rank: 6, id: "x" }], faceUpCount: 1 };
    expect(spiderFourSuitsRuleset.canStack(target, [{ suit: "♥", rank: 5, id: "y" }])).toBe(true);
  });
});

describe("Spider Four Suits reducer", () => {
  it("deal-row distributes 10 cards", () => {
    const s = initialState(42, S);
    const next = reducer(s, { type: "deal-row" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(40);
  });
});

describe("Spider Four Suits isTerminal", () => {
  it("returns score on win", () => {
    const s = initialState(42, S);
    const won: SpiderFourSuitsState = { ...s, completedSuits: 8, won: true, score: 380, movesMade: 200 };
    expect(isTerminal(won)!.score).toBe(380);
  });
});
