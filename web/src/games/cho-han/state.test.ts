import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ChoHanState } from "./state.js";

const settings = { rounds: "10" as const, betSize: "25" as const };

describe("initialState", () => {
  it("starts with correct bankroll and betting phase", () => {
    const s = initialState(42, settings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.round).toBe(1);
    expect(s.currentBet).toBeNull();
  });

  it("respects betSize setting", () => {
    const s = initialState(1, { rounds: "10" as const, betSize: "100" as const });
    expect(s.betSize).toBe(100);
  });
});

describe("bet action", () => {
  it("rolls dice and records roll", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bet", bet: "cho" });
    expect(s2.lastRoll).not.toBeNull();
    expect(s2.lastRoll).toHaveLength(2);
    expect(s2.lastSum).not.toBeNull();
  });

  it("adjusts bankroll on win", () => {
    // Find a seed that produces an even result for cho bet
    let s = initialState(42, settings);
    let attempts = 0;
    while (attempts < 100) {
      const s2 = reducer(s, { type: "bet", bet: "cho" });
      if (s2.lastResult === "win") {
        expect(s2.bankroll).toBe(s.bankroll + s.betSize);
        return;
      }
      s = { ...s, rngSeed: s.rngSeed + 1 };
      attempts++;
    }
    // Should have found a win in 100 attempts
    expect(attempts).toBeLessThan(100);
  });

  it("adjusts bankroll on loss", () => {
    let s = initialState(42, settings);
    let attempts = 0;
    while (attempts < 100) {
      const s2 = reducer(s, { type: "bet", bet: "cho" });
      if (s2.lastResult === "loss") {
        expect(s2.bankroll).toBe(s.bankroll - s.betSize);
        return;
      }
      s = { ...s, rngSeed: s.rngSeed + 1 };
      attempts++;
    }
    expect(attempts).toBeLessThan(100);
  });

  it("result matches cho/han logic", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bet", bet: "cho" });
    const sum = s2.lastSum!;
    const isEven = sum % 2 === 0;
    expect(s2.lastResult).toBe(isEven ? "win" : "loss");
  });

  it("cannot bet when out of money", () => {
    const s: ChoHanState = { ...initialState(42, settings), bankroll: 0 };
    const s2 = reducer(s, { type: "bet", bet: "han" });
    expect(s2.phase).toBe("gameOver");
  });

  it("game ends after max rounds", () => {
    let s = initialState(42, { rounds: "10" as const, betSize: "10" as const });
    s = { ...s, round: 10 };
    const s2 = reducer(s, { type: "bet", bet: "cho" });
    expect(s2.gameOver).toBe(true);
    expect(s2.phase).toBe("gameOver");
  });
});

describe("next action", () => {
  it("advances round from rolled to betting", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bet", bet: "cho" });
    if (s2.phase === "rolled") {
      const s3 = reducer(s2, { type: "next" });
      expect(s3.phase).toBe("betting");
      expect(s3.round).toBe(2);
      expect(s3.currentBet).toBeNull();
    }
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("terminal when gameOver", () => {
    const s: ChoHanState = { ...initialState(42, settings), gameOver: true, bankroll: 1200 };
    expect(isTerminal(s)).toEqual({ score: 1200 });
  });
});
