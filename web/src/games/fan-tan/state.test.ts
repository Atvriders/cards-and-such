import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { roundsPerSession: 15, bet: "10" as const };

describe("FanTan initialState", () => {
  it("starts with 1000 bankroll in betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.bets).toHaveLength(0);
  });
});

describe("FanTan place-bet", () => {
  it("deducts chip and records bet", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", on: 3 });
    expect(s2.bankroll).toBe(990);
    expect(s2.bets).toContain(3);
  });

  it("cannot place more than 2 bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", on: 1 });
    const s3 = reducer(s2, { type: "place-bet", on: 2 });
    const s4 = reducer(s3, { type: "place-bet", on: 3 });
    expect(s4.bets).toHaveLength(2);
  });
});

describe("FanTan remove-bet", () => {
  it("refunds removed bet", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", on: 2 });
    const s3 = reducer(s2, { type: "remove-bet", on: 2 });
    expect(s3.bankroll).toBe(1000);
    expect(s3.bets).toHaveLength(0);
  });
});

describe("FanTan reveal", () => {
  it("reveals result in 1-4 range", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", on: 1 });
    const s3 = reducer(s2, { type: "reveal" });
    expect(s3.phase).toBe("settled");
    expect(s3.result).toBeGreaterThanOrEqual(1);
    expect(s3.result).toBeLessThanOrEqual(4);
    expect(s3.roundsPlayed).toBe(1);
  });

  it("straight bet pays 3x on hit", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet", on: 1 });
    const s3 = reducer(s2, { type: "reveal" });
    if (s3.result === 1) {
      // Started at 990 after bet, win 3x = 30
      expect(s3.bankroll).toBe(1020); // 990 + 30
    } else {
      expect(s3.bankroll).toBe(990); // lost, no return
    }
  });
});

describe("FanTan isTerminal", () => {
  it("terminal when session done", () => {
    const s = initialState(42, defaultSettings);
    const end = { ...s, phase: "settled" as const, roundsPlayed: 15, bankroll: 700 };
    expect(isTerminal(end)?.score).toBe(700);
  });

  it("not terminal early", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});
