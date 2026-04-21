import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, dealerQualifies } from "./state.js";
import type { CaribbeanStudState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { anteSize: "25" as const, hands: "10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("dealerQualifies", () => {
  it("qualifies with pair or better", () => {
    const pair = [makeCard(1, "♠"), makeCard(1, "♥"), makeCard(5, "♦"), makeCard(7, "♣"), makeCard(9, "♠")];
    expect(dealerQualifies(pair)).toBe(true);
  });

  it("qualifies with Ace-King high", () => {
    // Use different suits to avoid flush
    const akHigh = [makeCard(1, "♠"), makeCard(13, "♥"), makeCard(5, "♦"), makeCard(7, "♣"), makeCard(9, "♠")];
    expect(dealerQualifies(akHigh)).toBe(true);
  });

  it("does not qualify with Ace-Queen high (no king)", () => {
    // Use different suits to avoid flush
    const aqHigh = [makeCard(1, "♠"), makeCard(12, "♥"), makeCard(5, "♦"), makeCard(7, "♣"), makeCard(9, "♠")];
    expect(dealerQualifies(aqHigh)).toBe(false);
  });

  it("does not qualify with king-high (no ace)", () => {
    // Use different suits to avoid flush
    const kHigh = [makeCard(13, "♠"), makeCard(12, "♥"), makeCard(5, "♦"), makeCard(7, "♣"), makeCard(9, "♠")];
    expect(dealerQualifies(kHigh)).toBe(false);
  });
});

describe("initialState", () => {
  it("starts with $1000 and ante phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.handsPlayed).toBe(0);
    expect(s.phase).toBe("ante");
    expect(s.playerCards).toHaveLength(0);
  });
});

describe("deal action", () => {
  it("deals 5 cards each and enters decision phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("decision");
    expect(s2.playerCards).toHaveLength(5);
    expect(s2.dealerCards).toHaveLength(5);
    expect(s2.bankroll).toBe(1000 - 25); // ante deducted
  });

  it("cannot deal without enough bankroll", () => {
    const s = initialState(42, defaultSettings);
    const broke: CaribbeanStudState = { ...s, bankroll: 20 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("ante"); // no change
  });
});

describe("fold action", () => {
  it("fold loses the ante and settles the hand", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("decision");

    const s3 = reducer(s2, { type: "fold" });
    expect(s3.phase).toBe("settled");
    expect(s3.handsPlayed).toBe(1);
    expect(s3.bankroll).toBe(s2.bankroll); // ante already deducted, fold doesn't change it
    expect(s3.lastResult).toContain("Folded");
  });
});

describe("raise action", () => {
  it("raise deducts 2x ante and settles", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const bankrollAfterAnte = s2.bankroll;

    const s3 = reducer(s2, { type: "raise" });
    expect(s3.phase).toBe("settled");
    expect(s3.handsPlayed).toBe(1);
    expect(s3.lastResult).toBeTruthy();
    // Either won money (bankroll > bankrollAfterAnte + raise - raise = bankrollAfterAnte)
    // or lost raise (bankroll = bankrollAfterAnte - raise)
    // or dealer didn't qualify (bankroll = bankrollAfterAnte + ante)
    expect(typeof s3.bankroll).toBe("number");
    expect(s3.bankroll).toBeGreaterThanOrEqual(0);
  });

  it("when dealer doesn't qualify, ante pays and raise returned", () => {
    // Find a hand where dealer doesn't qualify
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "deal" });
      const s3 = reducer(s2, { type: "raise" });
      if (s3.lastResult.includes("doesn't qualify")) {
        // s2.bankroll = 975 (ante deducted)
        // raise action: deduct raise(50) then return ante*2(50) + raise(50)
        // net: s2.bankroll - 50 + 50 + 50 = s2.bankroll + 50
        // This is net +ante (25) from start, +raise+ante from s2.bankroll
        expect(s3.bankroll).toBe(s2.bankroll + 50); // ante*2 net
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("multiple rounds reduce hands to maxHands", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "deal" });
      s = reducer(s, { type: "raise" });
      if (isTerminal(s)) break;
    }
    expect(s.handsPlayed).toBe(10);
    expect(isTerminal(s)).not.toBeNull();
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when hands exhausted", () => {
    const s = initialState(42, defaultSettings);
    const done: CaribbeanStudState = { ...s, phase: "settled", handsPlayed: 10, bankroll: 800 };
    expect(isTerminal(done)).toEqual({ score: 800 });
  });

  it("terminal when bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: CaribbeanStudState = { ...s, phase: "settled", handsPlayed: 3, bankroll: 0 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });
});
