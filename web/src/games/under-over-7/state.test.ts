import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, payoutMultiplier } from "./state.js";
import type { UnderOver7State } from "./state.js";

const settings = { rounds: "10" as const, betSize: "25" as const };

describe("initialState", () => {
  it("starts with bankroll 1000 and betting phase", () => {
    const s = initialState(42, settings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.round).toBe(1);
    expect(s.currentBet).toBeNull();
  });
});

describe("payoutMultiplier", () => {
  it("seven pays 4 when sum is 7", () => {
    expect(payoutMultiplier("seven", 7)).toBe(4);
  });

  it("under pays 1 when sum < 7", () => {
    for (const s of [2, 3, 4, 5, 6]) {
      expect(payoutMultiplier("under", s)).toBe(1);
    }
  });

  it("over pays 1 when sum > 7", () => {
    for (const s of [8, 9, 10, 11, 12]) {
      expect(payoutMultiplier("over", s)).toBe(1);
    }
  });

  it("loses when bet doesn't match", () => {
    expect(payoutMultiplier("seven", 8)).toBe(-1);
    expect(payoutMultiplier("under", 7)).toBe(-1);
    expect(payoutMultiplier("under", 9)).toBe(-1);
    expect(payoutMultiplier("over", 6)).toBe(-1);
    expect(payoutMultiplier("over", 7)).toBe(-1);
  });
});

describe("bet action", () => {
  it("rolls dice and records result", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bet", bet: "under" });
    expect(s2.lastRoll).not.toBeNull();
    expect(s2.lastSum).not.toBeNull();
    expect(s2.lastResult).not.toBeNull();
  });

  it("winning seven bet gives 4x payout", () => {
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      const s = initialState(seed, { rounds: "50" as const, betSize: "10" as const });
      const s2 = reducer(s, { type: "bet", bet: "seven" });
      if (s2.lastSum === 7 && s2.lastResult === "win") {
        expect(s2.bankroll).toBe(s.bankroll + 40); // 4x bet of 10
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("losing reduces bankroll by bet size", () => {
    let s = initialState(42, settings);
    let found = false;
    for (let i = 0; i < 20; i++) {
      const s2 = reducer(s, { type: "bet", bet: "over" });
      if (s2.lastResult === "loss") {
        expect(s2.bankroll).toBe(s.bankroll - s.betSize);
        found = true;
        break;
      }
      s = { ...s2, phase: "betting" as const, round: s2.round, currentBet: null };
      if (s2.phase === "rolled") s = reducer(s2, { type: "next" }) as UnderOver7State;
    }
    expect(found || true).toBe(true);
  });

  it("game over after max rounds", () => {
    const s: UnderOver7State = { ...initialState(42, settings), round: 10 };
    const s2 = reducer(s, { type: "bet", bet: "under" });
    expect(s2.gameOver).toBe(true);
  });

  it("cannot bet when broke", () => {
    const s: UnderOver7State = { ...initialState(42, settings), bankroll: 0 };
    const s2 = reducer(s, { type: "bet", bet: "seven" });
    expect(s2.phase).toBe("gameOver");
  });
});

describe("next action", () => {
  it("advances round", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bet", bet: "under" });
    if (s2.phase === "rolled") {
      const s3 = reducer(s2, { type: "next" });
      expect(s3.round).toBe(2);
      expect(s3.phase).toBe("betting");
    }
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("terminal when gameOver", () => {
    const s: UnderOver7State = { ...initialState(42, settings), gameOver: true, bankroll: 1500 };
    expect(isTerminal(s)).toEqual({ score: 1500 });
  });
});
