import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateHand } from "./state.js";
import type { LetItRideState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: 1000, anteSize: "10" as const, handsPerSession: 10 };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("initialState", () => {
  it("starts with correct bankroll and betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("evaluateHand", () => {
  it("royal flush pays 1000:1", () => {
    const cards = [makeCard(1, "♠"), makeCard(13, "♠"), makeCard(12, "♠"), makeCard(11, "♠"), makeCard(10, "♠")];
    expect(evaluateHand(cards)).toBe(1000);
  });

  it("straight flush pays 200:1", () => {
    const cards = [makeCard(9, "♥"), makeCard(8, "♥"), makeCard(7, "♥"), makeCard(6, "♥"), makeCard(5, "♥")];
    expect(evaluateHand(cards)).toBe(200);
  });

  it("pair of 10s pays 1:1", () => {
    const cards = [makeCard(10, "♠"), makeCard(10, "♥"), makeCard(3, "♦"), makeCard(5, "♣"), makeCard(8, "♠")];
    expect(evaluateHand(cards)).toBe(1);
  });

  it("pair of 9s pays 0 (below tens-or-better)", () => {
    const cards = [makeCard(9, "♠"), makeCard(9, "♥"), makeCard(3, "♦"), makeCard(5, "♣"), makeCard(8, "♠")];
    expect(evaluateHand(cards)).toBe(0);
  });

  it("pair of aces pays 1:1", () => {
    const cards = [makeCard(1, "♠"), makeCard(1, "♥"), makeCard(3, "♦"), makeCard(5, "♣"), makeCard(8, "♠")];
    expect(evaluateHand(cards)).toBe(1);
  });

  it("four of a kind pays 50:1", () => {
    const cards = [makeCard(7, "♠"), makeCard(7, "♥"), makeCard(7, "♦"), makeCard(7, "♣"), makeCard(8, "♠")];
    expect(evaluateHand(cards)).toBe(50);
  });

  it("high card pays 0", () => {
    const cards = [makeCard(2, "♠"), makeCard(5, "♥"), makeCard(8, "♦"), makeCard(10, "♣"), makeCard(13, "♠")];
    expect(evaluateHand(cards)).toBe(0);
  });
});

describe("deal action", () => {
  it("deducts 3× ante and enters decision1 phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("decision1");
    expect(s2.bankroll).toBe(1000 - 30); // 3 × $10
    expect(s2.playerCards).toHaveLength(3);
    expect(s2.community).toHaveLength(2); // stored but hidden
  });

  it("cannot deal without enough bankroll", () => {
    const s = initialState(42, defaultSettings);
    const broke: LetItRideState = { ...s, bankroll: 20 }; // need 30
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("betting");
  });
});

describe("pull-back action", () => {
  it("from decision1 returns ante and moves to decision2", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const bankrollBeforePull = s2.bankroll;
    const s3 = reducer(s2, { type: "pull-back" });
    expect(s3.phase).toBe("decision2");
    expect(s3.bankroll).toBe(bankrollBeforePull + 10);
    expect(s3.bet1Pulled).toBe(true);
  });

  it("from decision2 returns ante and settles", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "pull-back" }); // pull bet1
    const s4 = reducer(s3, { type: "pull-back" }); // pull bet2
    expect(s4.phase).toBe("settled");
    expect(s4.handsPlayed).toBe(1);
    expect(s4.lastResult).toBeTruthy();
  });
});

describe("let-it-ride action", () => {
  it("from decision1 moves to decision2 without refund", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const bankrollBefore = s2.bankroll;
    const s3 = reducer(s2, { type: "let-it-ride" });
    expect(s3.phase).toBe("decision2");
    expect(s3.bankroll).toBe(bankrollBefore);
    expect(s3.bet1Pulled).toBe(false);
  });

  it("from decision2 settles and reports result", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "let-it-ride" });
    const s4 = reducer(s3, { type: "let-it-ride" });
    expect(s4.phase).toBe("settled");
    expect(s4.handsPlayed).toBe(1);
    expect(s4.lastResult).toBeTruthy();
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when hands exhausted in settled phase", () => {
    const s = initialState(42, defaultSettings);
    const done: LetItRideState = { ...s, phase: "settled", handsPlayed: 10, bankroll: 500 };
    expect(isTerminal(done)).toEqual({ score: 500 });
  });

  it("terminal when bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: LetItRideState = { ...s, phase: "settled", handsPlayed: 3, bankroll: 0 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });

  it("not terminal in decision phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(isTerminal(s2)).toBeNull();
  });
});
