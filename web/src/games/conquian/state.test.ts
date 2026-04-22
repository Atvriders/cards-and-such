import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, conquianDeck, isValidMeld, findMelds, rankIndex } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Conquian - deck", () => {
  it("has 40 cards", () => {
    expect(conquianDeck()).toHaveLength(40);
  });

  it("no ranks 8, 9, or 10", () => {
    const ranks = conquianDeck().map(c => c.rank);
    [8, 9, 10].forEach(r => expect(ranks).not.toContain(r));
  });
});

describe("Conquian - isValidMeld", () => {
  it("accepts set of 3 same rank", () => {
    expect(isValidMeld([makeCard("♠", 5), makeCard("♥", 5), makeCard("♦", 5)])).toBe(true);
  });

  it("accepts run of 3 same suit (A,2,3)", () => {
    expect(isValidMeld([makeCard("♠", 1), makeCard("♠", 2), makeCard("♠", 3)])).toBe(true);
  });

  it("rejects run of 2", () => {
    expect(isValidMeld([makeCard("♠", 1), makeCard("♠", 2)])).toBe(false);
  });

  it("rejects mixed suit non-same-rank", () => {
    expect(isValidMeld([makeCard("♠", 1), makeCard("♥", 2), makeCard("♦", 3)])).toBe(false);
  });
});

describe("Conquian - initialState", () => {
  it("deals 10 cards each and has a discard", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(10);
    expect(state.botHand).toHaveLength(10);
    expect(state.discard).toHaveLength(1);
    expect(state.phase).toBe("player-draw");
  });
});

describe("Conquian - reducer take", () => {
  it("taking top discard moves to player-meld phase", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "take" });
    expect(next.phase).toBe("player-meld");
    expect(next.playerHand).toHaveLength(11);
    expect(next.drawnCard).not.toBeNull();
  });

  it("passing moves bot's turn", () => {
    const state = initialState(12345);
    const next = reducer(state, { type: "pass" });
    // Bot plays and returns player-draw or done
    expect(["player-draw", "done"]).toContain(next.phase);
  });
});

describe("Conquian - meld", () => {
  it("isTerminal returns null while playing", () => {
    const state = initialState(77);
    expect(isTerminal(state)).toBeNull();
  });
});

describe("Conquian - rankIndex", () => {
  it("A=0, K=9", () => {
    expect(rankIndex(1)).toBe(0);
    expect(rankIndex(13)).toBe(9);
  });
});
