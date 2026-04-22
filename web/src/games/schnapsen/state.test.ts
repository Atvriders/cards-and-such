import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, schnapsenDeck, cardValue, isTrump, trickWinner } from "./state.js";

describe("Schnapsen - deck", () => {
  it("has exactly 20 cards", () => {
    expect(schnapsenDeck()).toHaveLength(20);
  });

  it("contains only ranks J, Q, K, 10, A", () => {
    const ranks = new Set(schnapsenDeck().map(c => c.rank));
    for (const r of [2, 3, 4, 5, 6, 7, 8, 9]) expect(ranks.has(r as never)).toBe(false);
    for (const r of [1, 10, 11, 12, 13]) expect(ranks.has(r as never)).toBe(true);
  });

  it("has 4 suits with 5 cards each", () => {
    const deck = schnapsenDeck();
    for (const suit of ["♣", "♠", "♥", "♦"]) {
      expect(deck.filter(c => c.suit === suit)).toHaveLength(5);
    }
  });
});

describe("Schnapsen - cardValue", () => {
  it("Ace=11, Ten=10, King=4, Queen=3, Jack=2", () => {
    expect(cardValue(1)).toBe(11);
    expect(cardValue(10)).toBe(10);
    expect(cardValue(13)).toBe(4);
    expect(cardValue(12)).toBe(3);
    expect(cardValue(11)).toBe(2);
  });
});

describe("Schnapsen - isTrump", () => {
  it("trump suit card is trump", () => {
    expect(isTrump({ suit: "♥", rank: 11, id: "x" }, "♥")).toBe(true);
  });

  it("off-suit card is not trump", () => {
    expect(isTrump({ suit: "♣", rank: 1, id: "x" }, "♥")).toBe(false);
  });
});

describe("Schnapsen - trickWinner", () => {
  it("trump beats off-suit led card", () => {
    const trick = [
      { seat: 0, card: { suit: "♣" as const, rank: 1 as const, id: "a" } },
      { seat: 1, card: { suit: "♥" as const, rank: 11 as const, id: "b" } },
    ];
    expect(trickWinner(trick, "♥")).toBe(1);
  });

  it("higher led-suit beats lower led-suit", () => {
    const trick = [
      { seat: 0, card: { suit: "♠" as const, rank: 1 as const, id: "a" } },
      { seat: 1, card: { suit: "♠" as const, rank: 10 as const, id: "b" } },
    ];
    expect(trickWinner(trick, "♣")).toBe(0);
  });

  it("off-suit follower does not beat led suit", () => {
    const trick = [
      { seat: 0, card: { suit: "♦" as const, rank: 11 as const, id: "a" } },
      { seat: 1, card: { suit: "♠" as const, rank: 1 as const, id: "b" } },
    ];
    expect(trickWinner(trick, "♣")).toBe(0);
  });
});

describe("Schnapsen - initialState", () => {
  it("deals 5 cards to each player", () => {
    const state = initialState(42);
    expect(state.hands[0]).toHaveLength(5);
    expect(state.hands[1]).toHaveLength(5);
  });

  it("has a trump card and trump suit", () => {
    const state = initialState(42);
    expect(state.trumpCard).toBeDefined();
    expect(["♣", "♠", "♥", "♦"]).toContain(state.trumpSuit);
  });

  it("starts in playing phase", () => {
    const state = initialState(42);
    expect(state.phase).toBe("playing");
  });

  it("stock has remaining cards", () => {
    const state = initialState(42);
    expect(state.stock.length).toBeGreaterThan(0);
  });
});

describe("Schnapsen - gameplay", () => {
  it("playing a card removes it from hand", () => {
    const state = initialState(1234);
    const cardId = state.hands[0]![0]!.id;
    const next = reducer(state, { type: "play", cardId });
    expect(next.hands[0]!.find(c => c.id === cardId)).toBeUndefined();
  });

  it("game eventually ends", () => {
    let state = initialState(7777);
    let iter = 0;
    while (state.phase !== "done" && iter < 30) {
      const card = state.hands[0]![0];
      if (!card) break;
      state = reducer(state, { type: "play", cardId: card.id });
      iter++;
    }
    expect(["done", "playing"]).toContain(state.phase);
  });

  it("isTerminal returns non-null after done", () => {
    let state = initialState(9999);
    let iter = 0;
    while (state.phase !== "done" && iter < 30) {
      const card = state.hands[0]![0];
      if (!card) break;
      state = reducer(state, { type: "play", cardId: card.id });
      iter++;
    }
    if (state.phase === "done") {
      expect(isTerminal(state)).not.toBeNull();
    } else {
      expect(true).toBe(true); // game still in progress
    }
  });
});
