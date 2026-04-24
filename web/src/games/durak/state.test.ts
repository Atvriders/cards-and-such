import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, durakDeck, canBeat } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"]): Card {
  return { suit, rank, id: `t-${suit}${rank}` };
}

describe("Durak - deck", () => {
  it("has 36 cards", () => {
    expect(durakDeck()).toHaveLength(36);
  });

  it("only has ranks 6-10, J, Q, K, A", () => {
    const validRanks = new Set([1, 6, 7, 8, 9, 10, 11, 12, 13]);
    durakDeck().forEach(c => expect(validRanks.has(c.rank)).toBe(true));
  });
});

describe("Durak - canBeat", () => {
  it("higher same-suit beats lower", () => {
    const atk = makeCard("♠", 7);
    const def = makeCard("♠", 9);
    expect(canBeat(atk, def, "♥")).toBe(true);
  });

  it("trump beats non-trump", () => {
    const atk = makeCard("♠", 13); // King of spades (non-trump)
    const def = makeCard("♥", 6); // 6 of hearts (trump)
    expect(canBeat(atk, def, "♥")).toBe(true);
  });

  it("lower same-suit cannot beat higher", () => {
    const atk = makeCard("♠", 10);
    const def = makeCard("♠", 8);
    expect(canBeat(atk, def, "♥")).toBe(false);
  });

  it("non-trump cannot beat trump", () => {
    const atk = makeCard("♥", 6); // trump
    const def = makeCard("♠", 13); // non-trump
    expect(canBeat(atk, def, "♥")).toBe(false);
  });
});

describe("Durak - initialState", () => {
  it("deals 6 cards to each player", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(6);
    expect(state.botHand).toHaveLength(6);
  });

  it("has trump set", () => {
    const state = initialState(42);
    expect(["♠", "♥", "♦", "♣"]).toContain(state.trump);
  });

  it("starts in player-attack phase", () => {
    expect(initialState(42).phase).toBe("player-attack");
  });
});

describe("Durak - reducer", () => {
  it("attacking moves card from hand to table", () => {
    const state = initialState(99);
    const cardId = state.playerHand[0]!.id;
    const next = reducer(state, { type: "play-attack", cardId });
    expect(next.playerHand.find(c => c.id === cardId)).toBeUndefined();
  });

  it("ignores actions when done", () => {
    const doneState = { ...initialState(1), phase: "done" as const, finalScores: { player: 1, bot: 0 } };
    const after = reducer(doneState, { type: "play-attack", cardId: "x" });
    expect(after).toBe(doneState);
  });

  it("isTerminal returns null before done", () => {
    expect(isTerminal(initialState(5))).toBeNull();
  });
});
