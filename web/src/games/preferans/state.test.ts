import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, preferansDeck, cardValue, isTrump, trickWinner } from "./state.js";

describe("Preferans - deck", () => {
  it("has exactly 32 cards", () => {
    expect(preferansDeck()).toHaveLength(32);
  });

  it("contains only ranks 7-A", () => {
    const ranks = new Set(preferansDeck().map(c => c.rank));
    for (const r of [2, 3, 4, 5, 6]) expect(ranks.has(r as never)).toBe(false);
    for (const r of [7, 8, 9, 10, 11, 12, 13, 1]) expect(ranks.has(r as never)).toBe(true);
  });

  it("has 4 suits with 8 cards each", () => {
    const deck = preferansDeck();
    for (const suit of ["♣", "♠", "♥", "♦"]) {
      expect(deck.filter(c => c.suit === suit)).toHaveLength(8);
    }
  });
});

describe("Preferans - cardValue", () => {
  it("Ace=11, Ten=10, King=4, Queen=3, Jack=2, others=0", () => {
    expect(cardValue(1)).toBe(11);
    expect(cardValue(10)).toBe(10);
    expect(cardValue(13)).toBe(4);
    expect(cardValue(12)).toBe(3);
    expect(cardValue(11)).toBe(2);
    expect(cardValue(7)).toBe(0);
    expect(cardValue(8)).toBe(0);
  });
});

describe("Preferans - trickWinner", () => {
  it("trump beats off-suit led", () => {
    const trick = [
      { seat: 0, card: { suit: "♣" as const, rank: 1 as const, id: "a" } },
      { seat: 1, card: { suit: "♥" as const, rank: 7 as const, id: "b" } },
      { seat: 2, card: { suit: "♣" as const, rank: 13 as const, id: "c" } },
    ];
    expect(trickWinner(trick, "♥")).toBe(1);
  });

  it("highest led-suit card wins when no trump", () => {
    const trick = [
      { seat: 0, card: { suit: "♠" as const, rank: 9 as const, id: "a" } },
      { seat: 1, card: { suit: "♠" as const, rank: 1 as const, id: "b" } },
      { seat: 2, card: { suit: "♦" as const, rank: 13 as const, id: "c" } },
    ];
    expect(trickWinner(trick, "♣")).toBe(1);
  });

  it("off-suit does not beat led suit", () => {
    const trick = [
      { seat: 0, card: { suit: "♦" as const, rank: 7 as const, id: "a" } },
      { seat: 1, card: { suit: "♣" as const, rank: 1 as const, id: "b" } },
      { seat: 2, card: { suit: "♦" as const, rank: 8 as const, id: "c" } },
    ];
    expect(trickWinner(trick, "♠")).toBe(2); // ♦8 beats ♦7, ♣A off-suit
  });
});

describe("Preferans - initialState", () => {
  it("deals 10 cards to each of 3 players", () => {
    const state = initialState(42);
    for (let i = 0; i < 3; i++) {
      expect(state.hands[i]).toHaveLength(10);
    }
  });

  it("has a 2-card talon", () => {
    const state = initialState(42);
    expect(state.talon).toHaveLength(2);
  });

  it("starts in bidding phase", () => {
    const state = initialState(42);
    expect(state.phase).toBe("bidding");
  });

  it("total cards = 32", () => {
    const state = initialState(99);
    const total = state.hands.reduce((s, h) => s + h.length, 0) + state.talon.length;
    expect(total).toBe(32);
  });
});

describe("Preferans - gameplay", () => {
  it("bidding transitions to playing", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "bid" });
    expect(["playing", "done"]).toContain(next.phase);
    expect(next.declarer).toBe(0);
  });

  it("passing lets a bot become declarer", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "pass" });
    expect(["playing", "done"]).toContain(next.phase);
    expect(next.declarer).toBeGreaterThan(0);
  });

  it("game ends after bidding and playing through", () => {
    let state = initialState(1234);
    state = reducer(state, { type: "bid" });
    let iter = 0;
    while (state.phase !== "done" && iter < 200) {
      const hand = state.hands[0]!;
      if (hand.length === 0) break;
      let played = false;
      for (const card of hand) {
        const next = reducer(state, { type: "play", cardId: card.id });
        if (next !== state) { state = next; played = true; break; }
      }
      if (!played) break;
      iter++;
    }
    expect(state.phase).toBe("done");
  });

  it("isTerminal returns score after game ends", () => {
    let state = initialState(5678);
    state = reducer(state, { type: "bid" });
    let iter = 0;
    while (state.phase !== "done" && iter < 200) {
      const hand = state.hands[0]!;
      if (hand.length === 0) break;
      let played = false;
      for (const card of hand) {
        const next = reducer(state, { type: "play", cardId: card.id });
        if (next !== state) { state = next; played = true; break; }
      }
      if (!played) break;
      iter++;
    }
    const term = isTerminal(state);
    expect(term).not.toBeNull();
    expect(term!.score).toBeGreaterThanOrEqual(0);
    expect(term!.score).toBeLessThanOrEqual(100);
  });
});
