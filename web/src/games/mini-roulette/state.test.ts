import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { spinsPerSession: 20, chipValue: "10" as const };

describe("MiniRoulette initialState", () => {
  it("starts with 1000 bankroll in betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.bets).toHaveLength(0);
  });
});

describe("MiniRoulette place-bet", () => {
  it("deducts chip value from bankroll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", betType: "straight", numbers: [7] });
    expect(s2.bankroll).toBe(990);
    expect(s2.bets).toHaveLength(1);
    expect(s2.bets[0]!.numbers).toEqual([7]);
  });

  it("allows multiple bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", betType: "color", numbers: [1,3,5,7,9,11] });
    const s3 = reducer(s2, { type: "place-bet", betType: "straight", numbers: [3] });
    expect(s3.bets).toHaveLength(2);
    expect(s3.bankroll).toBe(980);
  });
});

describe("MiniRoulette clear-bets", () => {
  it("refunds all bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", betType: "straight", numbers: [5] });
    const s3 = reducer(s2, { type: "clear-bets" });
    expect(s3.bankroll).toBe(1000);
    expect(s3.bets).toHaveLength(0);
  });
});

describe("MiniRoulette spin", () => {
  it("goes to settled and records landed number", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", betType: "color", numbers: [1,3,5,7,9,11] });
    const s3 = reducer(s2, { type: "spin" });
    expect(s3.phase).toBe("settled");
    expect(s3.landedNumber).not.toBeNull();
    expect(s3.landedNumber!).toBeGreaterThanOrEqual(0);
    expect(s3.landedNumber!).toBeLessThanOrEqual(12);
    expect(s3.spinsPlayed).toBe(1);
  });
});

describe("MiniRoulette isTerminal", () => {
  it("terminal after session complete", () => {
    const s = initialState(42, defaultSettings);
    const end = { ...s, phase: "settled" as const, spinsPlayed: 20, bankroll: 300 };
    expect(isTerminal(end)?.score).toBe(300);
  });

  it("not terminal early", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});
