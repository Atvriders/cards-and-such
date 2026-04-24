import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, handValue, isPontoon, isFiveCardTrick } from "./state.js";
import type { PontoonState, PontoonHand } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { handsPerSession: 20, bet: "10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

function makeHand(cards: Card[], bet = 10): PontoonHand {
  return { cards, bet, busted: false, twisted: false, doubled: false, bought: false };
}

describe("Pontoon initialState", () => {
  it("starts with bankroll 1000, phase betting", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("Pontoon isPontoon", () => {
  it("recognises Ace + King as Pontoon", () => {
    expect(isPontoon([makeCard(1), makeCard(13)])).toBe(true);
  });

  it("does not count 3-card 21 as Pontoon", () => {
    expect(isPontoon([makeCard(7), makeCard(7), makeCard(7)])).toBe(false);
  });
});

describe("Pontoon isFiveCardTrick", () => {
  it("5 cards summing to 20 is a Five Card Trick", () => {
    const hand = [makeCard(2), makeCard(3), makeCard(4), makeCard(5), makeCard(6)]; // 20
    expect(isFiveCardTrick(hand)).toBe(true);
  });

  it("5 cards summing to 22 is NOT a Five Card Trick", () => {
    const hand = [makeCard(5), makeCard(5), makeCard(5), makeCard(5), makeCard(6)]; // 5+5+5+5+6=26 bust
    expect(isFiveCardTrick(hand)).toBe(false);
  });
});

describe("Pontoon deal", () => {
  it("deducts bet and gives player 2 cards", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.bankroll).toBeLessThan(1000);
    if (s2.phase === "player" || s2.phase === "settled") {
      expect(s2.playerHand.cards.length).toBe(2);
      expect(s2.dealerHand.length).toBe(2);
    }
  });
});

describe("Pontoon stick restriction", () => {
  it("cannot stick below 15", () => {
    const s = initialState(42, defaultSettings);
    const base: PontoonState = {
      ...s,
      phase: "player",
      bankroll: 990,
      playerHand: makeHand([makeCard(7), makeCard(5)]), // 12
      dealerHand: [makeCard(9), makeCard(8)],
    };
    const after = reducer(base, { type: "stick" });
    expect(after.phase).toBe("player"); // unchanged, still player phase
  });

  it("can stick at 15+", () => {
    const s = initialState(42, defaultSettings);
    const base: PontoonState = {
      ...s,
      phase: "player",
      bankroll: 990,
      playerHand: makeHand([makeCard(9), makeCard(7)]), // 16
      dealerHand: [makeCard(6), makeCard(9)],
    };
    const after = reducer(base, { type: "stick" });
    expect(after.phase).toBe("settled");
  });
});

describe("Pontoon terminal", () => {
  it("terminal when sessions complete", () => {
    const s = initialState(42, defaultSettings);
    const done: PontoonState = { ...s, phase: "settled", handsPlayed: 20, bankroll: 850 };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t?.score).toBe(850);
  });

  it("not terminal at start", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
});

describe("Pontoon handValue", () => {
  it("handles soft aces correctly", () => {
    const hand = [makeCard(1), makeCard(6)]; // A + 6 = soft 17
    const v = handValue(hand);
    expect(v.best).toBe(17);
    expect(v.soft).toBe(true);
  });
});
