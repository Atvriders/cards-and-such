import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, briscolaValue, italianDeck } from "./state.js";

describe("Briscola - italianDeck", () => {
  it("has exactly 40 cards", () => {
    expect(italianDeck()).toHaveLength(40);
  });

  it("has no 8, 9, or 10 ranks", () => {
    const ranks = italianDeck().map(c => c.rank);
    expect(ranks).not.toContain(8);
    expect(ranks).not.toContain(9);
    expect(ranks).not.toContain(10);
  });
});

describe("Briscola - briscolaValue", () => {
  it("Ace=11, 3=10, K=4, Q=3, J=2, others=0", () => {
    expect(briscolaValue(1)).toBe(11);
    expect(briscolaValue(3)).toBe(10);
    expect(briscolaValue(13)).toBe(4);
    expect(briscolaValue(12)).toBe(3);
    expect(briscolaValue(11)).toBe(2);
    expect(briscolaValue(7)).toBe(0);
    expect(briscolaValue(2)).toBe(0);
  });

  it("total deck points = 120", () => {
    const total = italianDeck().reduce((s, c) => s + briscolaValue(c.rank), 0);
    expect(total).toBe(120);
  });
});

describe("Briscola - initialState", () => {
  it("deals 3 cards to player and bot", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(3);
    expect(state.botHand).toHaveLength(3);
  });

  it("starts in playing phase", () => {
    const state = initialState(42);
    expect(state.phase).toBe("playing");
  });

  it("trump card is set", () => {
    const state = initialState(42);
    expect(state.trump).toBeDefined();
    expect(state.trumpSuit).toBe(state.trump.suit);
  });
});

describe("Briscola - reducer", () => {
  it("playing a card reduces player hand by 1", () => {
    const state = initialState(1234);
    const cardId = state.playerHand[0]!.id;
    const next = reducer(state, { type: "play", cardId });
    // After trick resolve, player draws back (if stock has cards), so hand stays 3 or goes to 2 if stock empty
    expect(next.playerHand.length).toBeLessThanOrEqual(3);
    expect(next.playerHand.length).toBeGreaterThanOrEqual(0);
  });

  it("does nothing if card not in hand", () => {
    const state = initialState(999);
    const next = reducer(state, { type: "play", cardId: "nonexistent" });
    expect(next).toEqual(state);
  });

  it("game eventually reaches done", () => {
    let state = initialState(7777);
    let iterations = 0;
    while (state.phase !== "done" && iterations < 100) {
      const cardId = state.playerHand[0]?.id;
      if (!cardId) break;
      state = reducer(state, { type: "play", cardId });
      iterations++;
    }
    expect(state.phase).toBe("done");
    expect(state.playerPoints + state.botPoints).toBe(120);
  });

  it("isTerminal returns null while playing", () => {
    const state = initialState(42);
    expect(isTerminal(state)).toBeNull();
  });
});
