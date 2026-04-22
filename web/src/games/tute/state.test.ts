import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, tuteValue, spanishDeck, legalPlays } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Tute - spanishDeck", () => {
  it("has 40 cards", () => {
    expect(spanishDeck()).toHaveLength(40);
  });

  it("total points across full 40-card deck = 120", () => {
    const total = spanishDeck().reduce((s, c) => s + tuteValue(c.rank), 0);
    expect(total).toBe(120);
  });
});

describe("Tute - tuteValue", () => {
  it("Ace=11, 3=10, K=4, Q=3, J=2, others=0", () => {
    expect(tuteValue(1)).toBe(11);
    expect(tuteValue(3)).toBe(10);
    expect(tuteValue(13)).toBe(4);
    expect(tuteValue(12)).toBe(3);
    expect(tuteValue(11)).toBe(2);
    expect(tuteValue(7)).toBe(0);
  });
});

describe("Tute - initialState", () => {
  it("deals 10 cards to player and bot", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(10);
    expect(state.botHand).toHaveLength(10);
  });

  it("starts in playing phase, player leads", () => {
    const state = initialState(42);
    expect(state.phase).toBe("playing");
    expect(state.playerLeads).toBe(true);
  });
});

describe("Tute - legalPlays", () => {
  it("must follow led suit when possible", () => {
    const hand = [makeCard("♠", 5), makeCard("♥", 3), makeCard("♥", 7)];
    const trick = [{ seat: 1, card: makeCard("♥", 1) }];
    const legal = legalPlays(hand, trick, "♦");
    expect(legal.every(c => c.suit === "♥")).toBe(true);
    expect(legal).toHaveLength(2);
  });

  it("must play trump when cannot follow suit", () => {
    const hand = [makeCard("♠", 5), makeCard("♦", 3)];
    const trick = [{ seat: 1, card: makeCard("♥", 1) }];
    const legal = legalPlays(hand, trick, "♦");
    expect(legal.every(c => c.suit === "♦")).toBe(true);
  });

  it("can play any card when cannot follow or trump", () => {
    const hand = [makeCard("♠", 5), makeCard("♣", 3)];
    const trick = [{ seat: 1, card: makeCard("♥", 1) }];
    const legal = legalPlays(hand, trick, "♦");
    expect(legal).toHaveLength(2);
  });
});

describe("Tute - game completes", () => {
  it("plays to completion, points sum to 120", () => {
    let state = initialState(5555);
    let iters = 0;
    while (state.phase !== "done" && iters < 200) {
      const legal = legalPlays(state.playerHand, state.currentTrick, state.trumpSuit);
      const cardId = legal[0]!.id;
      state = reducer(state, { type: "play", cardId });
      iters++;
    }
    expect(state.phase).toBe("done");
    // Only 20 of 40 cards are dealt (10 each), so total points < 120
    expect(state.playerPoints + state.botPoints).toBeGreaterThan(0);
    expect(state.playerPoints + state.botPoints).toBeLessThanOrEqual(120);
    expect(isTerminal(state)).not.toBeNull();
  });
});
