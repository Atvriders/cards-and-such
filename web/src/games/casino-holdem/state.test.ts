import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestHand, dealerQualifiesCheck } from "./state.js";
import type { CasinoHoldemState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { anteSize: "25" as const, hands: "10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("CasinoHoldem initialState", () => {
  it("starts with bankroll 1000, ante phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("ante");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("CasinoHoldem deal", () => {
  it("deal gives 2 player cards, 2 dealer cards, 3 community cards", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("decision");
    expect(s2.playerCards.length).toBe(2);
    expect(s2.dealerCards.length).toBe(2);
    expect(s2.communityCards.length).toBe(3);
    expect(s2.bankroll).toBe(1000 - 25);
  });
});

describe("CasinoHoldem fold", () => {
  it("fold loses the ante", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "fold" });
    expect(s3.phase).toBe("settled");
    expect(s3.handsPlayed).toBe(1);
    expect(s3.bankroll).toBe(975); // 1000 - 25
  });
});

describe("CasinoHoldem bestHand", () => {
  it("finds best 5-card hand from 7 cards", () => {
    // Two aces + pair of kings in community → two-pair or full house
    const hole: Card[] = [makeCard(1, "♠"), makeCard(1, "♥")];
    const comm: Card[] = [makeCard(13, "♣"), makeCard(13, "♦"), makeCard(2), makeCard(3), makeCard(5)];
    const hand = bestHand(hole, comm);
    expect(hand.class).toBe("two-pair");
  });
});

describe("CasinoHoldem dealerQualifiesCheck", () => {
  it("dealer qualifies with pair of 5s", () => {
    const hole: Card[] = [makeCard(5), makeCard(5, "♥")];
    const comm: Card[] = [makeCard(2), makeCard(7), makeCard(9), makeCard(11), makeCard(3)];
    expect(dealerQualifiesCheck(hole, comm)).toBe(true);
  });

  it("dealer does not qualify with pair of 3s", () => {
    const hole: Card[] = [makeCard(3), makeCard(3, "♥")];
    const comm: Card[] = [makeCard(2, "♣"), makeCard(7, "♦"), makeCard(9, "♥"), makeCard(11, "♣"), makeCard(8, "♦")];
    expect(dealerQualifiesCheck(hole, comm)).toBe(false);
  });
});

describe("CasinoHoldem terminal", () => {
  it("is terminal when hands reach limit", () => {
    const s = initialState(42, defaultSettings);
    const done: CasinoHoldemState = { ...s, phase: "settled", handsPlayed: 10, bankroll: 800 };
    expect(isTerminal(done)?.score).toBe(800);
  });

  it("not terminal at start", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
});
