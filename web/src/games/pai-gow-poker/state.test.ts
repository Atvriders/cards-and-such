import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, houseSplit, compareHands5, compareHands2, settleHands } from "./state.js";
import type { PaiGowPokerState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: 1000, anteSize: "25" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("initialState", () => {
  it("starts with correct bankroll and betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.handsPlayed).toBe(0);
    expect(s.playerCards).toHaveLength(0);
  });

  it("shoe has 53 cards (52 + joker)", () => {
    const s = initialState(42, defaultSettings);
    expect(s.shoe).toHaveLength(53);
  });
});

describe("deal action", () => {
  it("deals 7 cards to player and dealer, deducts ante", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("splitting");
    expect(s2.playerCards).toHaveLength(7);
    expect(s2.dealerCards).toHaveLength(7);
    expect(s2.bankroll).toBe(975); // 1000 - 25
  });

  it("cannot deal without enough bankroll", () => {
    const s = initialState(42, defaultSettings);
    const broke: PaiGowPokerState = { ...s, bankroll: 10 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("betting");
  });
});

describe("houseSplit", () => {
  it("returns 5-card high and 2-card low from 7 cards", () => {
    const cards = [
      makeCard(1, "♠"), makeCard(13, "♥"), makeCard(12, "♦"), makeCard(11, "♣"),
      makeCard(10, "♠"), makeCard(9, "♥"), makeCard(8, "♦"),
    ];
    const { high, low } = houseSplit(cards);
    expect(high).toHaveLength(5);
    expect(low).toHaveLength(2);
    // All 7 original cards accounted for
    const all = [...high, ...low];
    expect(all).toHaveLength(7);
  });

  it("prioritizes higher 5-card hand", () => {
    // With a straight possible in high, that should be chosen
    const cards = [
      makeCard(5, "♠"), makeCard(6, "♥"), makeCard(7, "♦"), makeCard(8, "♣"),
      makeCard(9, "♠"), makeCard(2, "♥"), makeCard(3, "♦"),
    ];
    const { high } = houseSplit(cards);
    expect(high).toHaveLength(5);
  });
});

describe("compareHands5", () => {
  it("pair beats high card", () => {
    const pair = [makeCard(5, "♠"), makeCard(5, "♥"), makeCard(7, "♦"), makeCard(9, "♣"), makeCard(2, "♠")];
    const highCard = [makeCard(1, "♠"), makeCard(13, "♥"), makeCard(12, "♦"), makeCard(10, "♣"), makeCard(8, "♠")];
    expect(compareHands5(pair, highCard)).toBeGreaterThan(0);
  });

  it("equal hands return 0", () => {
    const hand = [makeCard(1, "♠"), makeCard(13, "♥"), makeCard(12, "♦"), makeCard(10, "♣"), makeCard(8, "♦")];
    const same = [makeCard(1, "♣"), makeCard(13, "♣"), makeCard(12, "♣"), makeCard(10, "♠"), makeCard(8, "♣")];
    expect(compareHands5(hand, same)).toBe(0);
  });
});

describe("compareHands2", () => {
  it("ace beats king", () => {
    const aceHigh = [makeCard(1, "♠"), makeCard(5, "♥")];
    const kingHigh = [makeCard(13, "♠"), makeCard(10, "♥")];
    expect(compareHands2(aceHigh, kingHigh)).toBeGreaterThan(0);
  });
});

describe("settleHands", () => {
  it("returns push when one side wins each hand", () => {
    const playerHigh = [makeCard(1), makeCard(1, "♥"), makeCard(5), makeCard(7), makeCard(9)]; // pair aces
    const playerLow = [makeCard(2), makeCard(3)];
    const dealerHigh = [makeCard(13), makeCard(13, "♥"), makeCard(5), makeCard(7), makeCard(9)]; // pair kings
    const dealerLow = [makeCard(1, "♦"), makeCard(13, "♦")]; // ace-king
    const { bankrollDelta, result } = settleHands(playerHigh, playerLow, dealerHigh, dealerLow, 25);
    expect(bankrollDelta).toBe(0);
    expect(result).toContain("Push");
  });

  it("returns loss when dealer wins both hands", () => {
    const playerHigh = [makeCard(2), makeCard(3), makeCard(5), makeCard(7), makeCard(9)]; // high card
    const playerLow = [makeCard(2, "♥"), makeCard(3, "♥")];
    const dealerHigh = [makeCard(1), makeCard(1, "♥"), makeCard(1, "♦"), makeCard(1, "♣"), makeCard(9)]; // four aces
    const dealerLow = [makeCard(13), makeCard(13, "♥")]; // pair kings
    const { bankrollDelta } = settleHands(playerHigh, playerLow, dealerHigh, dealerLow, 25);
    expect(bankrollDelta).toBe(-25);
  });
});

describe("auto-split action", () => {
  it("resolves hand and moves to result phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "auto-split" });
    expect(s3.phase).toBe("result");
    expect(s3.handsPlayed).toBe(1);
    expect(s3.playerHigh).toHaveLength(5);
    expect(s3.playerLow).toHaveLength(2);
    expect(s3.lastResult).toBeTruthy();
  });

  it("multiple hands played consecutively", () => {
    let s = initialState(99, defaultSettings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "deal" });
      s = reducer(s, { type: "auto-split" });
      if (s.phase === "result") {
        s = { ...s, phase: "betting" }; // reset for next hand
      }
    }
    expect(s.handsPlayed).toBe(5);
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when bankroll is 0 in result phase", () => {
    const s = initialState(42, defaultSettings);
    const broke: PaiGowPokerState = { ...s, phase: "result", bankroll: 0, handsPlayed: 3 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });

  it("not terminal when bankroll positive in result phase", () => {
    const s = initialState(42, defaultSettings);
    const alive: PaiGowPokerState = { ...s, phase: "result", bankroll: 500, handsPlayed: 3 };
    expect(isTerminal(alive)).toBeNull();
  });
});
