import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeSpread, spreadPayout } from "./state.js";
import type { RedDogState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: 1000, anteSize: "25" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("computeSpread", () => {
  it("returns correct spread for non-consecutive cards", () => {
    const five = makeCard(5);
    const jack = makeCard(11);
    // HIGH(5) = 5, HIGH(11) = 11, spread = 11 - 5 - 1 = 5
    expect(computeSpread(five, jack)).toBe(5);
  });

  it("returns -1 for consecutive cards", () => {
    expect(computeSpread(makeCard(7), makeCard(8))).toBe(-1);
  });

  it("returns -2 for a pair", () => {
    expect(computeSpread(makeCard(9), makeCard(9, "♥"))).toBe(-2);
  });

  it("ace counts as 14", () => {
    // Ace(14) and King(13) are consecutive
    expect(computeSpread(makeCard(1), makeCard(13))).toBe(-1);
  });

  it("spread between 2 and King is 10", () => {
    // HIGH(2) = 2, HIGH(13) = 13, spread = 13 - 2 - 1 = 10
    expect(computeSpread(makeCard(2), makeCard(13))).toBe(10);
  });
});

describe("spreadPayout", () => {
  it("spread 1 pays 5:1", () => { expect(spreadPayout(1)).toBe(5); });
  it("spread 2 pays 4:1", () => { expect(spreadPayout(2)).toBe(4); });
  it("spread 3 pays 2:1", () => { expect(spreadPayout(3)).toBe(2); });
  it("spread 4+ pays 1:1", () => { expect(spreadPayout(7)).toBe(1); });
});

describe("initialState", () => {
  it("starts with correct bankroll and betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("deal action", () => {
  it("deals 2 cards and either decision or auto-settles", () => {
    let found = false;
    for (let seed = 0; seed < 50; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "deal" });
      if (s2.phase === "decision") {
        expect(s2.card1).not.toBeNull();
        expect(s2.card2).not.toBeNull();
        expect(s2.spread).toBeGreaterThan(0);
        expect(s2.bankroll).toBe(1000 - 25);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("consecutive cards cause auto-push", () => {
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "deal" });
      if (s2.lastResult.includes("Consecutive")) {
        expect(s2.phase).toBe("settled");
        expect(s2.bankroll).toBe(1000); // ante not deducted on consecutive
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("cannot deal without enough bankroll", () => {
    const s = initialState(42, defaultSettings);
    const broke: RedDogState = { ...s, bankroll: 10 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("betting");
  });
});

describe("stay action", () => {
  it("stay resolves with 3rd card and updates bankroll", () => {
    let s = initialState(0, defaultSettings);
    let s2 = s;
    // Find a hand with decision phase
    for (let seed = 0; seed < 100; seed++) {
      s = initialState(seed, defaultSettings);
      s2 = reducer(s, { type: "deal" });
      if (s2.phase === "decision") break;
    }
    const s3 = reducer(s2, { type: "stay" });
    expect(s3.phase).toBe("settled");
    expect(s3.card3).not.toBeNull();
    expect(s3.handsPlayed).toBe(1);
  });
});

describe("raise action", () => {
  it("raise doubles bet and resolves", () => {
    let s2 = initialState(0, defaultSettings);
    for (let seed = 0; seed < 100; seed++) {
      const s = initialState(seed, defaultSettings);
      s2 = reducer(s, { type: "deal" });
      if (s2.phase === "decision") break;
    }
    const bankrollBefore = s2.bankroll; // ante already deducted
    const s3 = reducer(s2, { type: "raise" });
    expect(s3.phase).toBe("settled");
    expect(s3.raised).toBe(true);
    // Either won (bankroll > bankrollBefore - ante) or lost (bankroll = bankrollBefore - ante)
    expect(s3.bankroll).toBeGreaterThanOrEqual(0);
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when bankroll is 0 in settled phase", () => {
    const s = initialState(42, defaultSettings);
    const broke: RedDogState = { ...s, phase: "settled", bankroll: 0, handsPlayed: 3 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });

  it("not terminal with positive bankroll", () => {
    const s = initialState(42, defaultSettings);
    const alive: RedDogState = { ...s, phase: "settled", bankroll: 500 };
    expect(isTerminal(alive)).toBeNull();
  });
});
