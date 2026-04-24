import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isTonkMeld, tonkCardValue, findBestMelds } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"]): Card {
  return { suit, rank, id: `t-${suit}${rank}` };
}

describe("Tonk - isTonkMeld", () => {
  it("three of a kind is a set", () => {
    const cards = [makeCard("♠", 7), makeCard("♥", 7), makeCard("♦", 7)];
    expect(isTonkMeld(cards)).toBe(true);
  });

  it("three consecutive same suit is a run", () => {
    const cards = [makeCard("♠", 5), makeCard("♠", 6), makeCard("♠", 7)];
    expect(isTonkMeld(cards)).toBe(true);
  });

  it("two cards is not a meld", () => {
    expect(isTonkMeld([makeCard("♠", 5), makeCard("♥", 5)])).toBe(false);
  });

  it("non-consecutive fails", () => {
    const cards = [makeCard("♠", 2), makeCard("♠", 4), makeCard("♠", 6)];
    expect(isTonkMeld(cards)).toBe(false);
  });
});

describe("Tonk - tonkCardValue", () => {
  it("Ace = 1", () => expect(tonkCardValue(1)).toBe(1));
  it("King = 10", () => expect(tonkCardValue(13)).toBe(10));
  it("7 = 7", () => expect(tonkCardValue(7)).toBe(7));
});

describe("Tonk - findBestMelds", () => {
  it("finds a set meld and marks rest as deadwood", () => {
    const hand = [
      makeCard("♠", 9), makeCard("♥", 9), makeCard("♦", 9),
      makeCard("♣", 2),
    ];
    const { melds, deadwood } = findBestMelds(hand);
    expect(melds.length).toBeGreaterThan(0);
    expect(deadwood).toHaveLength(1);
  });
});

describe("Tonk - initialState", () => {
  it("deals 7 cards each", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(7);
    expect(state.botHand).toHaveLength(7);
  });

  it("starts in draw phase", () => {
    expect(initialState(42).phase).toBe("draw");
  });
});

describe("Tonk - reducer", () => {
  it("drawing from stock moves to discard phase", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "draw-stock" });
    expect(next.phase).toBe("discard");
    expect(next.drawnCard).not.toBeNull();
  });

  it("game ends after stock is empty", () => {
    let state = initialState(3);
    let iterations = 0;
    while (state.phase !== "done" && iterations < 300) {
      if (state.phase === "draw") {
        state = reducer(state, { type: "draw-stock" });
      } else if (state.phase === "discard") {
        const fullHand = state.drawnCard ? [...state.playerHand, state.drawnCard] : [...state.playerHand];
        const cardId = fullHand[fullHand.length - 1]!.id;
        state = reducer(state, { type: "discard", cardId });
      } else break;
      iterations++;
    }
    expect(state.phase).toBe("done");
  });

  it("isTerminal returns null before done", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });
});
