import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, gameValue, legalPlays, computeSetbackPoints } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Setback - gameValue", () => {
  it("Ace=4, K=3, Q=2, J=1, 10=10, others=0", () => {
    expect(gameValue(1)).toBe(4);
    expect(gameValue(13)).toBe(3);
    expect(gameValue(12)).toBe(2);
    expect(gameValue(11)).toBe(1);
    expect(gameValue(10)).toBe(10);
    expect(gameValue(7)).toBe(0);
  });
});

describe("Setback - initialState", () => {
  it("deals 6 cards to each of 4 players", () => {
    const state = initialState(42);
    expect(state.hands).toHaveLength(4);
    state.hands.forEach(h => expect(h).toHaveLength(6));
  });

  it("starts in bidding phase", () => {
    expect(initialState(42).phase).toBe("bidding");
  });
});

describe("Setback - bidding", () => {
  it("bidding moves to name-trump or playing", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "bid", amount: 4 });
    expect(["name-trump", "playing"]).toContain(next.phase);
  });

  it("bid of 0 (pass) still resolves bidding", () => {
    const state = initialState(99);
    const next = reducer(state, { type: "bid", amount: 0 });
    expect(["name-trump", "playing"]).toContain(next.phase);
  });
});

describe("Setback - legalPlays", () => {
  it("can play any card when leading", () => {
    const hand = [makeCard("♠", 5), makeCard("♥", 3)];
    const legal = legalPlays(hand, [], "♦");
    expect(legal).toHaveLength(2);
  });

  it("can follow led suit or trump", () => {
    const hand = [makeCard("♠", 5), makeCard("♥", 3), makeCard("♦", 7)];
    const trick = [{ seat: 1, card: makeCard("♠", 8) }];
    const legal = legalPlays(hand, trick, "♦");
    // Can play ♠5 (led) or ♦7 (trump)
    expect(legal).toHaveLength(2);
  });
});

describe("Setback - computeSetbackPoints", () => {
  it("awards high and low trump, jack, game", () => {
    const state = initialState(1);
    const trump: Card["suit"] = "♠";
    const fakeState = {
      ...state,
      trumpSuit: trump,
      highBidder: 0,
      highBid: 2,
      captures: [
        [makeCard("♠", 1), makeCard("♠", 11)], // player has A♠ (high), J♠ (jack)
        [makeCard("♠", 2)], // bot1 has low trump
        [makeCard("♥", 10)], // bot2 has 10h
        [makeCard("♦", 1)], // bot3 has ace of diamonds (game pt)
      ] as Card[][],
    };
    const pts = computeSetbackPoints(fakeState, trump);
    expect(pts[0]).toBeGreaterThanOrEqual(2); // high + jack
    expect(pts[1]).toBeGreaterThanOrEqual(1); // low
  });
});
