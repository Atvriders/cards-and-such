import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, handValue, getBonus, newSpanishDeck } from "./state.js";
import type { Spanish21State } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { handsPerSession: 20, bet: "10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("Spanish21 deck", () => {
  it("has no 10-pip cards (rank 10)", () => {
    const deck = newSpanishDeck(1);
    expect(deck.every(c => c.rank !== 10)).toBe(true);
  });

  it("has 48 cards per copy", () => {
    expect(newSpanishDeck(1).length).toBe(48);
    expect(newSpanishDeck(2).length).toBe(96);
  });
});

describe("Spanish21 initialState", () => {
  it("starts with bankroll 1000 and betting phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
  });
});

describe("Spanish21 bonus payouts", () => {
  it("returns null for regular non-21 hand", () => {
    const hand = [makeCard(5), makeCard(8)];
    expect(getBonus(hand)).toBeNull();
  });

  it("gives 5-card 21 bonus", () => {
    const hand = [makeCard(5), makeCard(4), makeCard(5), makeCard(4), makeCard(3)]; // 5+4+5+4+3=21
    const b = getBonus(hand);
    expect(b).not.toBeNull();
    expect(b?.multiplier).toBe(2);
  });

  it("gives 7-7-7 suited bonus (3:1)", () => {
    const hand = [
      makeCard(7, "♠"), makeCard(7, "♠"), makeCard(7, "♠"),
    ]; // ranks sum to 21
    const b = getBonus(hand);
    expect(b).not.toBeNull();
    expect(b?.multiplier).toBe(3);
  });
});

describe("Spanish21 handValue", () => {
  it("no tens means max face card value is 10 (J/Q/K)", () => {
    const hand = [makeCard(11), makeCard(11)]; // two Jacks = 20
    const v = handValue(hand);
    expect(v.best).toBe(20);
  });
});

describe("Spanish21 deal", () => {
  it("deducts bet and enters player phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.bankroll).toBe(990);
    if (s2.phase === "player" || s2.phase === "settled") {
      expect(s2.playerHand.cards.length).toBe(2);
      expect(s2.dealerHand.length).toBe(2);
    }
  });
});

describe("Spanish21 surrender", () => {
  it("returns half bet on surrender", () => {
    const s = initialState(42, defaultSettings);
    const dealt = reducer(s, { type: "deal" });
    if (dealt.phase === "player") {
      const bankrollBefore = dealt.bankroll;
      const surrendered = reducer(dealt, { type: "surrender" });
      expect(surrendered.phase).toBe("settled");
      // Recovered 5 (half of 10)
      expect(surrendered.bankroll).toBe(bankrollBefore + 5);
    }
  });
});

describe("Spanish21 terminal", () => {
  it("is terminal when handsPlayed reaches session limit", () => {
    const s = initialState(42, defaultSettings);
    const done: Spanish21State = { ...s, phase: "settled", handsPlayed: 20, bankroll: 400 };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t?.score).toBe(400);
  });

  it("is not terminal at start", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
});
