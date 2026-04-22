import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, beloteDeck, cardValue, isTrump, trickWinner } from "./state.js";

describe("Belote - deck", () => {
  it("has exactly 32 cards", () => {
    expect(beloteDeck()).toHaveLength(32);
  });

  it("contains only ranks 7-A", () => {
    const ranks = new Set(beloteDeck().map(c => c.rank));
    for (const r of [2, 3, 4, 5, 6]) expect(ranks.has(r as never)).toBe(false);
  });
});

describe("Belote - cardValue", () => {
  it("trump Jack (Jass)=20, trump 9 (Menel)=14", () => {
    expect(cardValue(11, true)).toBe(20);
    expect(cardValue(9, true)).toBe(14);
  });

  it("Ace=11 in both contexts", () => {
    expect(cardValue(1, true)).toBe(11);
    expect(cardValue(1, false)).toBe(11);
  });

  it("off-suit Jack=2, off-suit 9=0", () => {
    expect(cardValue(11, false)).toBe(2);
    expect(cardValue(9, false)).toBe(0);
  });

  it("King=4, Queen=3 in off-suit", () => {
    expect(cardValue(13, false)).toBe(4);
    expect(cardValue(12, false)).toBe(3);
  });
});

describe("Belote - isTrump", () => {
  it("trump suit card is trump", () => {
    expect(isTrump({ suit: "♥", rank: 7, id: "x" }, "♥")).toBe(true);
  });

  it("off-suit card is not trump", () => {
    expect(isTrump({ suit: "♣", rank: 1, id: "x" }, "♥")).toBe(false);
  });
});

describe("Belote - trickWinner", () => {
  it("trump beats off-suit lead", () => {
    const trick = [
      { seat: 0, card: { suit: "♣" as const, rank: 1 as const, id: "a" } },
      { seat: 1, card: { suit: "♥" as const, rank: 7 as const, id: "b" } },
    ];
    expect(trickWinner(trick, "♥")).toBe(1);
  });

  it("Jass beats Menel", () => {
    const trick = [
      { seat: 0, card: { suit: "♦" as const, rank: 11 as const, id: "j" } },
      { seat: 1, card: { suit: "♦" as const, rank: 9 as const, id: "m" } },
    ];
    expect(trickWinner(trick, "♦")).toBe(0);
  });

  it("led suit beats other non-trump", () => {
    const trick = [
      { seat: 0, card: { suit: "♠" as const, rank: 10 as const, id: "t" } },
      { seat: 1, card: { suit: "♣" as const, rank: 1 as const, id: "a" } },
    ];
    expect(trickWinner(trick, "♥")).toBe(0);
  });
});

describe("Belote - initialState", () => {
  it("deals 8 cards to each of 4 players", () => {
    const state = initialState(42);
    for (let i = 0; i < 4; i++) {
      expect(state.hands[i]).toHaveLength(8);
    }
  });

  it("starts in bidding phase", () => {
    const state = initialState(42);
    expect(state.phase).toBe("bidding");
  });

  it("turnUpCard is defined", () => {
    const state = initialState(42);
    expect(state.turnUpCard).toBeDefined();
    expect(state.turnUpCard.suit).toBeDefined();
  });

  it("total cards = 32", () => {
    const state = initialState(99);
    const total = state.hands.reduce((s, h) => s + h.length, 0);
    expect(total).toBe(32);
  });
});

describe("Belote - reducer", () => {
  it("accepting trump transitions to playing phase", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "accept" });
    expect(["playing", "done"]).toContain(next.phase);
    expect(next.trumpSuit).toBe(state.turnUpCard.suit);
  });

  it("passing lets a bot accept trump", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "pass" });
    expect(["playing", "done"]).toContain(next.phase);
    expect(next.trumpSuit).not.toBeNull();
  });

  it("game ends after accepting and playing through", () => {
    let state = initialState(1234);
    state = reducer(state, { type: "accept" });
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
    state = reducer(state, { type: "accept" });
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
