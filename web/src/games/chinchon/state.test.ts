import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, chinchonDeck, isMeld, bestMelds, cardValue } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"]): Card {
  return { suit, rank, id: `t-${suit}${rank}` };
}

describe("Chinchón - deck", () => {
  it("has 40 cards", () => {
    expect(chinchonDeck()).toHaveLength(40);
  });

  it("all ranks are in Spanish deck set", () => {
    const validRanks = new Set([1, 2, 3, 4, 5, 6, 7, 11, 12, 13]);
    chinchonDeck().forEach(c => expect(validRanks.has(c.rank)).toBe(true));
  });
});

describe("Chinchón - isMeld", () => {
  it("three same rank is a set", () => {
    const cards = [makeCard("♠", 7), makeCard("♥", 7), makeCard("♦", 7)];
    expect(isMeld(cards)).toBe(true);
  });

  it("three consecutive same suit is a run", () => {
    const cards = [makeCard("♠", 1), makeCard("♠", 2), makeCard("♠", 3)];
    expect(isMeld(cards)).toBe(true);
  });

  it("two cards is not a meld", () => {
    const cards = [makeCard("♠", 1), makeCard("♥", 1)];
    expect(isMeld(cards)).toBe(false);
  });

  it("non-consecutive is not a run", () => {
    const cards = [makeCard("♠", 1), makeCard("♠", 3), makeCard("♠", 5)];
    expect(isMeld(cards)).toBe(false);
  });
});

describe("Chinchón - bestMelds", () => {
  it("finds meld and leaves deadwood", () => {
    const hand = [
      makeCard("♠", 1), makeCard("♠", 2), makeCard("♠", 3),
      makeCard("♥", 7),
    ];
    const { melds, deadwood } = bestMelds(hand);
    expect(melds.length).toBeGreaterThanOrEqual(1);
    expect(deadwood).toHaveLength(1);
    expect(deadwood[0]!.rank).toBe(7);
  });

  it("returns all as deadwood when no melds possible", () => {
    const hand = [makeCard("♠", 1), makeCard("♥", 6), makeCard("♦", 13)];
    const { melds, deadwood } = bestMelds(hand);
    expect(melds).toHaveLength(0);
    expect(deadwood).toHaveLength(3);
  });
});

describe("Chinchón - cardValue", () => {
  it("Jack=8, Queen=9, King=10", () => {
    expect(cardValue(11)).toBe(8);
    expect(cardValue(12)).toBe(9);
    expect(cardValue(13)).toBe(10);
  });
});

describe("Chinchón - initialState", () => {
  it("deals 7 cards to each player", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(7);
    expect(state.botHand).toHaveLength(7);
  });

  it("starts in draw phase", () => {
    expect(initialState(42).phase).toBe("draw");
  });
});

describe("Chinchón - reducer", () => {
  it("drawing from stock moves to discard phase", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "draw-stock" });
    expect(next.phase).toBe("discard");
    expect(next.drawnCard).not.toBeNull();
  });

  it("ignores actions when done", () => {
    const doneState = { ...initialState(1), phase: "done" as const, finalScores: { player: 0, bot: 5 } };
    const after = reducer(doneState, { type: "draw-stock" });
    expect(after).toBe(doneState);
  });
});
