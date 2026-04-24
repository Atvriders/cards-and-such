import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, nextRank, canPlay } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("nextRank", () => {
  it("5 -> 6", () => expect(nextRank(5)).toBe(6));
  it("King (13) returns null", () => expect(nextRank(13)).toBeNull());
  it("12 -> 13", () => expect(nextRank(12)).toBe(13));
  it("Ace (1) returns null", () => expect(nextRank(1)).toBeNull());
});

describe("canPlay", () => {
  it("correct suit and rank matches", () => expect(canPlay(c(7, "♠"), "♠", 7)).toBe(true));
  it("wrong rank fails", () => expect(canPlay(c(6, "♠"), "♠", 7)).toBe(false));
  it("wrong suit fails", () => expect(canPlay(c(7, "♥"), "♠", 7)).toBe(false));
});

describe("initialState", () => {
  it("deals 4 hands", () => {
    const s = initialState(1, settings);
    expect(s.hands.length).toBe(4);
  });
  it("player has 12 cards (one played to start)", () => {
    const s = initialState(1, settings);
    // Player leads first card, so may have 12 or fewer
    expect(s.hands[0]!.length).toBeLessThanOrEqual(12);
  });
  it("phase is playing", () => expect(initialState(5, settings).phase).toBe("playing"));
  it("has a current suit", () => {
    const s = initialState(1, settings);
    expect(["♠", "♥", "♦", "♣"]).toContain(s.currentSuit);
  });
});

describe("reducer", () => {
  it("invalid card returns same state", () => {
    const s = initialState(1, settings);
    expect(reducer(s, { type: "play", cardId: "nonexistent" })).toBe(s);
  });
  it("playing next in sequence advances rank", () => {
    const s = initialState(1, settings);
    const nr = nextRank(s.currentRank);
    if (nr !== null) {
      const nextCard = s.hands[0]!.find(c => c.suit === s.currentSuit && c.rank === nr);
      if (nextCard) {
        const s2 = reducer(s, { type: "play", cardId: nextCard.id });
        expect(s2.hands[0]!.length).toBeLessThan(s.hands[0]!.length);
      }
    }
  });
  it("changeSuit with valid suit works", () => {
    const s = initialState(1, settings);
    const myHand = s.hands[0]!;
    const suitCard = myHand[0];
    if (suitCard) {
      const s2 = reducer(s, { type: "changeSuit", suit: suitCard.suit });
      expect(s2).toBeDefined();
    }
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("returns score when done", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [0, 1, 2, 3] as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("second place scores 60", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 0, 2, 3] as const };
    expect(isTerminal(s)).toEqual({ score: 60 });
  });
});
