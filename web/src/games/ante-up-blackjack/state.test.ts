import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, handValue, isBlackjack, anteBonus } from "./state.js";
import type { AnteUpState, AnteUpHand } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { handsPerSession: 20, mainBet: "10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

function makeHand(cards: Card[], mainBet = 10, anteBet = 2): AnteUpHand {
  return { cards, mainBet, anteBet, busted: false, stood: false, doubled: false };
}

describe("AnteUpBlackjack initialState", () => {
  it("starts with bankroll 1000, betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("AnteUpBlackjack deal", () => {
  it("deducts main + ante bet", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    // mainBet = 10, anteBet = ceil(10 * 0.2) = 2
    expect(s2.bankroll).toBeLessThanOrEqual(1000 - 12);
  });
});

describe("AnteUpBlackjack anteBonus", () => {
  it("Blackjack gives 2:1 ante bonus", () => {
    const hand = [makeCard(1), makeCard(13)]; // A + K
    const bonus = anteBonus(hand, 5);
    expect(bonus).not.toBeNull();
    expect(bonus?.payout).toBe(10); // 5 * 2
  });

  it("three-card 21 gives 1:1 ante bonus", () => {
    const hand = [makeCard(7), makeCard(7), makeCard(7)]; // 21
    const bonus = anteBonus(hand, 5);
    expect(bonus).not.toBeNull();
    expect(bonus?.payout).toBe(5);
  });

  it("non-21 hand gives no ante bonus", () => {
    const hand = [makeCard(10), makeCard(8)]; // 18
    expect(anteBonus(hand, 5)).toBeNull();
  });
});

describe("AnteUpBlackjack isBlackjack", () => {
  it("A+K = blackjack", () => expect(isBlackjack([makeCard(1), makeCard(13)])).toBe(true));
  it("A+K+5 is not blackjack", () => expect(isBlackjack([makeCard(1), makeCard(13), makeCard(5)])).toBe(false));
});

describe("AnteUpBlackjack stand", () => {
  it("standing triggers dealer play and settlement", () => {
    const s = initialState(42, defaultSettings);
    const base: AnteUpState = {
      ...s,
      phase: "player",
      bankroll: 988,
      playerHand: makeHand([makeCard(10), makeCard(8)]),
      dealerHand: [makeCard(6), makeCard(9)],
      dealerFaceDown: true,
    };
    const settled = reducer(base, { type: "stand" });
    expect(settled.phase).toBe("settled");
    expect(settled.lastResult).toBeTruthy();
  });
});

describe("AnteUpBlackjack terminal", () => {
  it("is terminal when hands reach limit", () => {
    const s = initialState(42, defaultSettings);
    const done: AnteUpState = { ...s, phase: "settled", handsPlayed: 20, bankroll: 600 };
    expect(isTerminal(done)?.score).toBe(600);
  });

  it("not terminal at start", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
});
