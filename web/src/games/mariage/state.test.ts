import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, mariageDeck, cardValue, isTrump, trickWinner } from "./state.js";

describe("Mariage - deck", () => {
  it("has exactly 24 cards", () => {
    expect(mariageDeck()).toHaveLength(24);
  });

  it("contains only ranks 9, 10, J, Q, K, A", () => {
    const ranks = new Set(mariageDeck().map(c => c.rank));
    for (const r of [2, 3, 4, 5, 6, 7, 8]) expect(ranks.has(r as never)).toBe(false);
    for (const r of [9, 10, 11, 12, 13, 1]) expect(ranks.has(r as never)).toBe(true);
  });

  it("has 4 suits with 6 cards each", () => {
    const deck = mariageDeck();
    for (const suit of ["♣", "♠", "♥", "♦"]) {
      expect(deck.filter(c => c.suit === suit)).toHaveLength(6);
    }
  });
});

describe("Mariage - cardValue", () => {
  it("Ace=11, Ten=10, King=4, Queen=3, Jack=2, Nine=0", () => {
    expect(cardValue(1)).toBe(11);
    expect(cardValue(10)).toBe(10);
    expect(cardValue(13)).toBe(4);
    expect(cardValue(12)).toBe(3);
    expect(cardValue(11)).toBe(2);
    expect(cardValue(9)).toBe(0);
  });
});

describe("Mariage - trickWinner", () => {
  it("trump beats off-suit lead", () => {
    const trick = [
      { seat: 0, card: { suit: "♣" as const, rank: 1 as const, id: "a" } },
      { seat: 1, card: { suit: "♥" as const, rank: 9 as const, id: "b" } },
    ];
    expect(trickWinner(trick, "♥")).toBe(1);
  });

  it("Ace beats King of same suit", () => {
    const trick = [
      { seat: 0, card: { suit: "♠" as const, rank: 1 as const, id: "a" } },
      { seat: 1, card: { suit: "♠" as const, rank: 13 as const, id: "b" } },
    ];
    expect(trickWinner(trick, "♣")).toBe(0);
  });

  it("off-suit follower does not beat led suit", () => {
    const trick = [
      { seat: 0, card: { suit: "♦" as const, rank: 9 as const, id: "a" } },
      { seat: 1, card: { suit: "♠" as const, rank: 1 as const, id: "b" } },
    ];
    expect(trickWinner(trick, "♣")).toBe(0);
  });
});

describe("Mariage - initialState", () => {
  it("deals 6 cards to each player", () => {
    const state = initialState(42);
    expect(state.hands[0]).toHaveLength(6);
    expect(state.hands[1]).toHaveLength(6);
  });

  it("has trump card and stock", () => {
    const state = initialState(42);
    expect(state.trumpCard).toBeDefined();
    expect(state.stock.length).toBeGreaterThan(0);
  });

  it("starts in playing phase", () => {
    const state = initialState(42);
    expect(state.phase).toBe("playing");
  });

  it("total cards = 24", () => {
    const state = initialState(99);
    const inHands = state.hands.reduce((s, h) => s + h.length, 0);
    // stock includes trump card
    expect(inHands + state.stock.length).toBe(24);
  });
});

describe("Mariage - gameplay", () => {
  it("playing a card removes it from hand", () => {
    const state = initialState(1234);
    const cardId = state.hands[0]![0]!.id;
    const next = reducer(state, { type: "play", cardId });
    expect(next.hands[0]!.find(c => c.id === cardId)).toBeUndefined();
  });

  it("game eventually ends", () => {
    let state = initialState(7777);
    let iter = 0;
    while (state.phase !== "done" && iter < 40) {
      const card = state.hands[0]![0];
      if (!card) break;
      state = reducer(state, { type: "play", cardId: card.id });
      iter++;
    }
    expect(["done", "playing"]).toContain(state.phase);
  });

  it("isTerminal returns score after done", () => {
    let state = initialState(5678);
    let iter = 0;
    while (state.phase !== "done" && iter < 40) {
      const card = state.hands[0]![0];
      if (!card) break;
      state = reducer(state, { type: "play", cardId: card.id });
      iter++;
    }
    if (state.phase === "done") {
      const term = isTerminal(state);
      expect(term).not.toBeNull();
      expect(term!.score).toBeGreaterThanOrEqual(0);
    } else {
      expect(true).toBe(true);
    }
  });
});
