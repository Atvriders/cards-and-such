import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, sicBoMultiplier, betLabel } from "./state.js";
import type { SicBoState } from "./state.js";

const defaultSettings = { startingBankroll: 1000, rollsPerSession: "10" as const };

describe("initialState", () => {
  it("starts with correct bankroll and betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.rollsPlayed).toBe(0);
    expect(s.bets).toHaveLength(0);
  });
});

describe("sicBoMultiplier", () => {
  it("small pays 1:1 for sum 4–10 with no triple", () => {
    expect(sicBoMultiplier("small", [1, 3, 4])).toBe(1); // sum 8
    expect(sicBoMultiplier("small", [3, 3, 3])).toBe(0); // triple (sum 9 but triple)
  });

  it("big pays 1:1 for sum 11–17 with no triple", () => {
    expect(sicBoMultiplier("big", [4, 5, 6])).toBe(1); // sum 15
    expect(sicBoMultiplier("big", [6, 6, 6])).toBe(0); // triple
  });

  it("any triple pays 30:1", () => {
    expect(sicBoMultiplier("any-triple", [5, 5, 5])).toBe(30);
    expect(sicBoMultiplier("any-triple", [1, 2, 3])).toBe(0);
  });

  it("specific triple pays 180:1", () => {
    expect(sicBoMultiplier({ type: "specific-triple", value: 4 }, [4, 4, 4])).toBe(180);
    expect(sicBoMultiplier({ type: "specific-triple", value: 4 }, [5, 5, 5])).toBe(0);
  });

  it("specific single pays 1, 2, or 3 based on count", () => {
    expect(sicBoMultiplier({ type: "specific-single", value: 3 }, [3, 1, 2])).toBe(1);
    expect(sicBoMultiplier({ type: "specific-single", value: 3 }, [3, 3, 2])).toBe(2);
    expect(sicBoMultiplier({ type: "specific-single", value: 3 }, [3, 3, 3])).toBe(3);
    expect(sicBoMultiplier({ type: "specific-single", value: 3 }, [1, 2, 4])).toBe(0);
  });

  it("specific double pays 10:1", () => {
    expect(sicBoMultiplier({ type: "specific-double", value: 6 }, [6, 6, 2])).toBe(10);
    expect(sicBoMultiplier({ type: "specific-double", value: 6 }, [6, 1, 2])).toBe(0);
  });

  it("specific sum pays correctly", () => {
    expect(sicBoMultiplier({ type: "specific-sum", value: 4 }, [1, 1, 2])).toBe(60);
    expect(sicBoMultiplier({ type: "specific-sum", value: 9 }, [2, 3, 4])).toBe(6);
    expect(sicBoMultiplier({ type: "specific-sum", value: 17 }, [5, 6, 6])).toBe(60);
  });
});

describe("betLabel", () => {
  it("returns correct labels", () => {
    expect(betLabel("small")).toBe("Small (4–10)");
    expect(betLabel("big")).toBe("Big (11–17)");
    expect(betLabel("any-triple")).toBe("Any Triple");
    expect(betLabel({ type: "specific-triple", value: 5 })).toBe("Triple 5");
    expect(betLabel({ type: "specific-single", value: 3 })).toBe("Single 3");
  });
});

describe("place-bet action", () => {
  it("adds bet and deducts from bankroll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", betType: "small", amount: 25 });
    expect(s2.bets).toHaveLength(1);
    expect(s2.bankroll).toBe(975);
  });

  it("cannot bet more than bankroll", () => {
    const s = initialState(42, defaultSettings);
    const broke: SicBoState = { ...s, bankroll: 10 };
    const s2 = reducer(broke, { type: "place-bet", betType: "small", amount: 25 });
    expect(s2.bets).toHaveLength(0);
    expect(s2.bankroll).toBe(10);
  });
});

describe("clear-bets action", () => {
  it("clears all bets and refunds bankroll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", betType: "small", amount: 25 });
    const s3 = reducer(s2, { type: "place-bet", betType: "big", amount: 25 });
    const s4 = reducer(s3, { type: "clear-bets" });
    expect(s4.bets).toHaveLength(0);
    expect(s4.bankroll).toBe(1000);
  });
});

describe("roll action", () => {
  it("rolls dice and resolves bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", betType: "small", amount: 10 });
    const s2b = reducer(s2, { type: "place-bet", betType: "big", amount: 10 });
    const s3 = reducer(s2b, { type: "roll" });
    expect(s3.phase).toBe("rolled");
    expect(s3.dice).not.toBeNull();
    expect(s3.dice).toHaveLength(3);
    expect(s3.rollsPlayed).toBe(1);
    expect(s3.lastResult).toBeTruthy();
    // One of small/big must win, so bankroll should be positive
    expect(s3.bankroll).toBeGreaterThan(0);
  });

  it("cannot roll without bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("betting");
    expect(s2.dice).toBeNull();
  });

  it("after roll, next roll resets to betting phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", betType: "small", amount: 10 });
    const s3 = reducer(s2, { type: "roll" });
    expect(s3.phase).toBe("rolled");
    const s4 = reducer(s3, { type: "roll" }); // trigger new round
    expect(s4.phase).toBe("betting");
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal after max rolls", () => {
    const s = initialState(42, defaultSettings);
    const maxed: SicBoState = { ...s, phase: "rolled", rollsPlayed: 10, bankroll: 900 };
    expect(isTerminal(maxed)).toEqual({ score: 900 });
  });

  it("terminal when bankroll 0 after roll", () => {
    const s = initialState(42, defaultSettings);
    const broke: SicBoState = { ...s, phase: "rolled", rollsPlayed: 3, bankroll: 0 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });

  it("not terminal in betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
