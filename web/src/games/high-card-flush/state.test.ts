import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestFlush } from "./state.js";
import type { Card } from "./state.js";

const defaultSettings = { rounds: "10" as const };

function card(suit: Card["suit"], rank: Card["rank"]): Card {
  return { suit, rank, id: `${suit}${rank}` };
}

describe("bestFlush", () => {
  it("finds longest flush", () => {
    const hand: Card[] = [
      card("♠", 2), card("♠", 5), card("♠", 9),
      card("♥", 3), card("♥", 7),
      card("♦", 4),
      card("♣", 6),
    ];
    const result = bestFlush(hand);
    expect(result.suit).toBe("♠");
    expect(result.cards.length).toBe(3);
  });

  it("uses high card for tie-break between equal flush lengths", () => {
    // 3 spades with A vs 3 hearts with K
    const hand: Card[] = [
      card("♠", 1), card("♠", 5), card("♠", 3),
      card("♥", 13), card("♥", 8), card("♥", 2),
      card("♦", 4),
    ];
    const result = bestFlush(hand);
    expect(result.suit).toBe("♠"); // Ace > King
  });

  it("handles a hand where all cards are different suits", () => {
    const hand: Card[] = [
      card("♠", 1), card("♥", 2), card("♦", 3), card("♣", 4),
      card("♠", 5), card("♥", 6), card("♦", 7),
    ];
    const result = bestFlush(hand);
    expect(result.cards.length).toBe(2);
  });
});

describe("initialState", () => {
  it("starts with correct bankroll and round counts", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.currentRound).toBe(0);
    expect(s.totalRounds).toBe(10);
    expect(s.phase).toBe("deal");
    expect(s.winner).toBeNull();
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
    expect(s1.bankroll).toBe(s2.bankroll);
  });
});

describe("reducer — deal", () => {
  it("advances round and changes phase to reveal", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("reveal");
    expect(s2.currentRound).toBe(1);
    expect(s2.playerHand.length).toBe(7);
    expect(s2.botHand.length).toBe(7);
  });

  it("adjusts bankroll based on winner", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    // Either +100, -100, or +0
    expect([900, 1000, 1100]).toContain(s2.bankroll);
  });

  it("is a no-op when phase is reveal", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("reveal");
    const s3 = reducer(s2, { type: "deal" });
    expect(s3).toBe(s2);
  });
});

describe("reducer — next-round", () => {
  it("resets to deal phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("reveal");
    const s3 = reducer(s2, { type: "next-round" });
    expect(s3.phase).toBe("deal");
    expect(s3.playerHand.length).toBe(0);
  });
});

describe("isTerminal", () => {
  it("returns null when game not started", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score after all rounds played", () => {
    let s = initialState(42, { rounds: "5" as const });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "deal" });
      if (s.phase === "reveal") s = reducer(s, { type: "next-round" });
    }
    // After 5 deals, the game should be terminatable
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(typeof t!.score).toBe("number");
  });
});
