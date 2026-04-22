import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankThreeHand, dealerQualifies, compareThreeHands } from "./state.js";
import type { ThreeCardPokerState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: 1000, bets: "both" as const, anteSize: "25" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("rankThreeHand", () => {
  it("identifies straight flush", () => {
    const cards = [makeCard(7, "♥"), makeCard(8, "♥"), makeCard(9, "♥")];
    expect(rankThreeHand(cards).class).toBe("straight-flush");
  });

  it("identifies three of a kind", () => {
    const cards = [makeCard(5, "♠"), makeCard(5, "♥"), makeCard(5, "♦")];
    expect(rankThreeHand(cards).class).toBe("three-of-a-kind");
  });

  it("identifies flush", () => {
    const cards = [makeCard(2, "♣"), makeCard(7, "♣"), makeCard(11, "♣")];
    expect(rankThreeHand(cards).class).toBe("flush");
  });

  it("identifies straight", () => {
    const cards = [makeCard(10, "♠"), makeCard(11, "♥"), makeCard(12, "♦")];
    expect(rankThreeHand(cards).class).toBe("straight");
  });

  it("identifies pair", () => {
    const cards = [makeCard(9, "♠"), makeCard(9, "♥"), makeCard(3, "♦")];
    expect(rankThreeHand(cards).class).toBe("one-pair");
  });

  it("identifies high card", () => {
    const cards = [makeCard(2, "♠"), makeCard(7, "♥"), makeCard(11, "♦")];
    expect(rankThreeHand(cards).class).toBe("high-card");
  });
});

describe("dealerQualifies", () => {
  it("qualifies with queen high", () => {
    const cards = [makeCard(12, "♠"), makeCard(5, "♥"), makeCard(3, "♦")];
    expect(dealerQualifies(cards)).toBe(true);
  });

  it("does not qualify with jack high", () => {
    const cards = [makeCard(11, "♠"), makeCard(5, "♥"), makeCard(3, "♦")];
    expect(dealerQualifies(cards)).toBe(false);
  });

  it("qualifies with any pair", () => {
    const cards = [makeCard(2, "♠"), makeCard(2, "♥"), makeCard(3, "♦")];
    expect(dealerQualifies(cards)).toBe(true);
  });
});

describe("compareThreeHands", () => {
  it("straight flush beats three of a kind", () => {
    const sf = [makeCard(4, "♥"), makeCard(5, "♥"), makeCard(6, "♥")];
    const trips = [makeCard(13, "♠"), makeCard(13, "♥"), makeCard(13, "♦")];
    expect(compareThreeHands(sf, trips)).toBeGreaterThan(0);
  });

  it("pair beats high card", () => {
    const pair = [makeCard(2, "♠"), makeCard(2, "♥"), makeCard(9, "♦")];
    const high = [makeCard(1, "♠"), makeCard(11, "♥"), makeCard(8, "♦")]; // A,J,8 — no straight/flush
    expect(compareThreeHands(pair, high)).toBeGreaterThan(0);
  });
});

describe("deal action", () => {
  it("deals 3 cards each and deducts ante + pair plus", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("decision");
    expect(s2.playerCards).toHaveLength(3);
    expect(s2.dealerCards).toHaveLength(3);
    expect(s2.bankroll).toBe(1000 - 50); // ante(25) + pair-plus(25)
  });

  it("cannot deal without enough bankroll", () => {
    const s = initialState(42, defaultSettings);
    const broke: ThreeCardPokerState = { ...s, bankroll: 10 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("betting");
  });
});

describe("fold action", () => {
  it("fold loses ante and settles", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "fold" });
    expect(s3.phase).toBe("settled");
    expect(s3.handsPlayed).toBe(1);
    expect(s3.lastResult).toContain("Folded");
  });
});

describe("play action", () => {
  it("play action resolves hand and updates bankroll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "play" });
    expect(s3.phase).toBe("settled");
    expect(s3.handsPlayed).toBe(1);
    expect(typeof s3.bankroll).toBe("number");
    expect(s3.bankroll).toBeGreaterThanOrEqual(0);
    expect(s3.lastResult).toBeTruthy();
  });

  it("multiple hands can be played", () => {
    let s = initialState(99, defaultSettings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "deal" });
      if (s.phase === "decision") s = reducer(s, { type: "play" });
      if (s.bankroll <= 0) break;
    }
    expect(s.handsPlayed).toBeGreaterThan(0);
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when bankroll is 0 in settled phase", () => {
    const s = initialState(42, defaultSettings);
    const broke: ThreeCardPokerState = { ...s, phase: "settled", bankroll: 0, handsPlayed: 3 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });

  it("not terminal with positive bankroll in settled phase", () => {
    const s = initialState(42, defaultSettings);
    const alive: ThreeCardPokerState = { ...s, phase: "settled", bankroll: 500, handsPlayed: 3 };
    expect(isTerminal(alive)).toBeNull();
  });
});
