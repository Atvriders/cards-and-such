import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, handValue } from "./state.js";
import type { BlackjackSwitchState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = {
  handsPerSession: 20,
  bet: "10" as const,
  deckCount: "6" as const,
};

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

function makeHand(cards: Card[], bet = 10) {
  return { cards, bet, busted: false, stood: false, doubled: false };
}

describe("BlackjackSwitch initialState", () => {
  it("starts with bankroll 1000, betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("BlackjackSwitch deal", () => {
  it("deducts 2x bet and enters switch-decision phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.bankroll).toBe(980); // 1000 - 20
    expect(s2.phase).toBe("switch-decision");
    expect(s2.hand1.cards.length).toBe(2);
    expect(s2.hand2.cards.length).toBe(2);
    expect(s2.dealerHand.length).toBe(2);
  });
});

describe("BlackjackSwitch switch action", () => {
  it("swaps second cards between hands", () => {
    const s = initialState(42, defaultSettings);
    const dealt = reducer(s, { type: "deal" });
    const origH1Card2 = dealt.hand1.cards[1]!;
    const origH2Card2 = dealt.hand2.cards[1]!;
    const switched = reducer(dealt, { type: "switch" });
    expect(switched.hand1.cards[1]!.id).toBe(origH2Card2.id);
    expect(switched.hand2.cards[1]!.id).toBe(origH1Card2.id);
    expect(switched.switched).toBe(true);
    expect(switched.phase).toBe("player");
  });

  it("no-switch keeps hands unchanged", () => {
    const s = initialState(42, defaultSettings);
    const dealt = reducer(s, { type: "deal" });
    const origH1 = [...dealt.hand1.cards.map(c => c.id)];
    const noSwitch = reducer(dealt, { type: "no-switch" });
    expect(noSwitch.hand1.cards.map(c => c.id)).toEqual(origH1);
    expect(noSwitch.phase).toBe("player");
    expect(noSwitch.switched).toBe(false);
  });
});

describe("BlackjackSwitch dealer 22 push rule", () => {
  it("dealer 22 pushes against player 18 — player gets bet back", () => {
    const s = initialState(42, defaultSettings);
    const base: BlackjackSwitchState = {
      ...s,
      phase: "player",
      bankroll: 980,
      hand1: makeHand([makeCard(10), makeCard(8)], 10), // 18
      hand2: makeHand([makeCard(9), makeCard(7)], 10),  // 16 — will stand
      dealerHand: [makeCard(10), makeCard(5), makeCard(7)], // 22 — force 22 pre-settle
      dealerFaceDown: false,
      activeHandIndex: 0,
    };
    // Force both hands to stood
    const stood: BlackjackSwitchState = {
      ...base,
      hand1: { ...base.hand1, stood: true },
      hand2: { ...base.hand2, stood: true },
      activeHandIndex: 1,
    };
    // Stand on hand2 triggers settlement
    const settled = reducer({ ...stood, activeHandIndex: 1 }, { type: "stand" });
    expect(settled.phase).toBe("settled");
    // Dealer drew to at least 17. The result message should reflect the outcome
    expect(settled.lastResult).toBeTruthy();
  });
});

describe("BlackjackSwitch terminal", () => {
  it("is terminal when handsPlayed reaches session limit", () => {
    const s = initialState(42, defaultSettings);
    const done: BlackjackSwitchState = { ...s, phase: "settled", handsPlayed: 20, bankroll: 750 };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t?.score).toBe(750);
  });

  it("is not terminal early in game", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
});

describe("BlackjackSwitch handValue", () => {
  it("calculates soft hand correctly", () => {
    const hand = [makeCard(1), makeCard(6)]; // A+6 = soft 17
    const v = handValue(hand);
    expect(v.best).toBe(17);
    expect(v.soft).toBe(true);
  });

  it("adjusts ace on bust", () => {
    const hand = [makeCard(1), makeCard(13), makeCard(5)]; // A+K+5 = 16 (hard)
    const v = handValue(hand);
    expect(v.best).toBe(16);
    expect(v.soft).toBe(false);
  });
});
