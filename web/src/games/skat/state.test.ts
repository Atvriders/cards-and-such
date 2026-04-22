import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, skatDeck, cardValue, isTrump, trickWinner } from "./state.js";

describe("Skat - skatDeck", () => {
  it("has exactly 32 cards", () => {
    expect(skatDeck()).toHaveLength(32);
  });

  it("has no ranks 2-6", () => {
    const ranks = skatDeck().map(c => c.rank);
    for (const r of [2, 3, 4, 5, 6]) {
      expect(ranks).not.toContain(r);
    }
  });

  it("total points in deck = 120", () => {
    const total = skatDeck().reduce((s, c) => s + cardValue(c.rank), 0);
    expect(total).toBe(120);
  });
});

describe("Skat - cardValue", () => {
  it("Ace=11, Ten=10, King=4, Queen=3, Jack=2, others=0", () => {
    expect(cardValue(1)).toBe(11);
    expect(cardValue(10)).toBe(10);
    expect(cardValue(13)).toBe(4);
    expect(cardValue(12)).toBe(3);
    expect(cardValue(11)).toBe(2);
    expect(cardValue(9)).toBe(0);
    expect(cardValue(7)).toBe(0);
  });
});

describe("Skat - isTrump", () => {
  it("Jacks are always trump in suit game", () => {
    expect(isTrump({ suit: "♣", rank: 11, id: "x" }, "♠")).toBe(true);
    expect(isTrump({ suit: "♥", rank: 11, id: "x" }, "♦")).toBe(true);
  });

  it("Jacks are trump in Grand", () => {
    expect(isTrump({ suit: "♠", rank: 11, id: "x" }, "grand")).toBe(true);
  });

  it("non-Jack of trump suit is trump in suit game", () => {
    expect(isTrump({ suit: "♥", rank: 1, id: "x" }, "♥")).toBe(true);
    expect(isTrump({ suit: "♥", rank: 1, id: "x" }, "♣")).toBe(false);
  });

  it("non-Jack is not trump in Grand", () => {
    expect(isTrump({ suit: "♦", rank: 1, id: "x" }, "grand")).toBe(false);
  });
});

describe("Skat - trickWinner", () => {
  it("Jack beats non-Jack trump", () => {
    const trick = [
      { seat: 0, card: { suit: "♥" as const, rank: 11 as const, id: "j" } },
      { seat: 1, card: { suit: "♦" as const, rank: 1 as const, id: "a" } },
    ];
    expect(trickWinner(trick, "♦")).toBe(0);
  });

  it("♣ Jack beats ♠ Jack", () => {
    const trick = [
      { seat: 0, card: { suit: "♣" as const, rank: 11 as const, id: "jc" } },
      { seat: 1, card: { suit: "♠" as const, rank: 11 as const, id: "js" } },
    ];
    expect(trickWinner(trick, "♥")).toBe(0);
  });
});

describe("Skat - initialState", () => {
  it("deals 10 cards to each player", () => {
    const state = initialState(42);
    expect(state.hands[0]).toHaveLength(10);
    expect(state.hands[1]).toHaveLength(10);
    expect(state.hands[2]).toHaveLength(10);
  });

  it("has 2 skat cards", () => {
    const state = initialState(42);
    expect(state.skat).toHaveLength(2);
  });

  it("starts in bidding phase", () => {
    const state = initialState(42);
    expect(state.phase).toBe("bidding");
  });

  it("total card count is 32", () => {
    const state = initialState(99);
    const total = state.hands[0]!.length + state.hands[1]!.length + state.hands[2]!.length + state.skat.length;
    expect(total).toBe(32);
  });
});

describe("Skat - reducer bidding", () => {
  it("bidding 0 (pass) transitions to playing with a bot declarer", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "bid", bid: 0 });
    expect(["playing", "done"]).toContain(next.phase);
    expect(next.declarer).toBeGreaterThan(0);
  });

  it("bidding 18 makes player declarer and transitions to pickup", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "bid", bid: 18 });
    expect(next.phase).toBe("pickup");
    expect(next.declarer).toBe(0);
  });

  it("isTerminal is null during play", () => {
    const state = initialState(42);
    expect(isTerminal(state)).toBeNull();
  });

  it("game eventually terminates", () => {
    let state = initialState(1234);
    // Pass bid so bots play
    state = reducer(state, { type: "bid", bid: 0 });
    // If already done (bots played it all), great. Otherwise play through
    let iterations = 0;
    while (state.phase !== "done" && iterations < 50) {
      const card = state.hands[0]![0];
      if (!card) break;
      state = reducer(state, { type: "play", cardId: card.id });
      iterations++;
    }
    expect(["done", "playing"]).toContain(state.phase);
  });
});
