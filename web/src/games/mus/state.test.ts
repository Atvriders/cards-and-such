import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, musDeck, musCardValue, handValue, hasJuego } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Mus - musDeck", () => {
  it("has 40 cards", () => {
    expect(musDeck()).toHaveLength(40);
  });

  it("no ranks 8, 9, or 10", () => {
    [8, 9, 10].forEach(r => expect(musDeck().map(c => c.rank)).not.toContain(r));
  });
});

describe("Mus - musCardValue", () => {
  it("Ace=11, 3=10, J/Q/K=10, 7=7", () => {
    expect(musCardValue(1)).toBe(11);
    expect(musCardValue(3)).toBe(10);
    expect(musCardValue(11)).toBe(10);
    expect(musCardValue(12)).toBe(10);
    expect(musCardValue(13)).toBe(10);
    expect(musCardValue(7)).toBe(7);
  });
});

describe("Mus - handValue & hasJuego", () => {
  it("hand with A,A,A,A = 44, has Juego", () => {
    const hand = [makeCard("♠", 1), makeCard("♥", 1), makeCard("♦", 1), makeCard("♣", 1)];
    expect(handValue(hand)).toBe(44);
    expect(hasJuego(hand)).toBe(true);
  });

  it("hand with 2,2,2,2 = 8, no Juego", () => {
    const hand = [makeCard("♠", 2), makeCard("♥", 2), makeCard("♦", 2), makeCard("♣", 2)];
    expect(handValue(hand)).toBe(8);
    expect(hasJuego(hand)).toBe(false);
  });

  it("hand with K,K,K,2 = 32, has Juego (>=31)", () => {
    const hand = [makeCard("♠", 13), makeCard("♥", 13), makeCard("♦", 13), makeCard("♣", 2)];
    expect(handValue(hand)).toBe(32);
    expect(hasJuego(hand)).toBe(true);
  });
});

describe("Mus - initialState", () => {
  it("deals 4 cards to player and 3 bots", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(4);
    expect(state.botHands).toHaveLength(3);
    state.botHands.forEach(h => expect(h).toHaveLength(4));
  });

  it("starts in bidding phase", () => {
    expect(initialState(42).phase).toBe("bidding");
  });
});

describe("Mus - reducer", () => {
  it("bidding resolves to done", () => {
    const state = initialState(42);
    const pv = handValue(state.playerHand);
    const next = reducer(state, { type: "bid", amount: pv });
    expect(next.phase).toBe("done");
    expect(isTerminal(next)).not.toBeNull();
  });

  it("bid of 0 still resolves", () => {
    const state = initialState(99);
    const next = reducer(state, { type: "bid", amount: 0 });
    expect(next.phase).toBe("done");
  });
});
