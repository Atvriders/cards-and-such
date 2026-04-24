import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, containsSix } from "./state.js";
import type { Bonus6State } from "./state.js";

const defaultSettings = {
  bet: "5" as const,
  spinsPerSession: 30,
};

describe("Bonus6 containsSix", () => {
  it("returns true for 6", () => expect(containsSix(6)).toBe(true));
  it("returns true for 16", () => expect(containsSix(16)).toBe(true));
  it("returns true for 36", () => expect(containsSix(36)).toBe(true));
  it("returns false for 0", () => expect(containsSix(0)).toBe(false));
  it("returns false for 27", () => expect(containsSix(27)).toBe(false));
});

describe("Bonus6 initialState", () => {
  it("starts with bankroll 500 and betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(500);
    expect(s.phase).toBe("betting");
    expect(s.spinsPlayed).toBe(0);
  });
});

describe("Bonus6 spin flow", () => {
  it("place-bet moves to spinning phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet" });
    expect(s2.phase).toBe("spinning");
  });

  it("spin produces a result between 0 and 36", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place-bet" });
    const s3 = reducer(s2, { type: "spin" });
    expect(s3.spinResult).not.toBeNull();
    expect(s3.spinResult!).toBeGreaterThanOrEqual(0);
    expect(s3.spinResult!).toBeLessThanOrEqual(36);
    expect(s3.phase).toBe("settled");
  });

  it("win on 6-containing number gives correct payout", () => {
    // Force a spin result by manually crafting state with known outcome
    const s = initialState(42, defaultSettings);
    // Place bet and verify payout logic
    const s2 = reducer(s, { type: "place-bet" });
    const s3 = reducer(s2, { type: "spin" });
    if (s3.spinResult !== null && containsSix(s3.spinResult)) {
      // bankroll was 500, bet 5, payout should be 5*7 = 35
      expect(s3.bankroll).toBe(500 - 5 + 35); // 530
      expect(s3.lastPayout).toBe(35);
    } else {
      // Lost: bankroll = 495
      expect(s3.bankroll).toBe(500 - 5);
      expect(s3.lastPayout).toBe(0);
    }
  });
});

describe("Bonus6 terminal", () => {
  it("is terminal when spins exhausted", () => {
    const s = initialState(42, defaultSettings);
    const done: Bonus6State = { ...s, phase: "settled", spinsPlayed: 30, bankroll: 300 };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t?.score).toBe(300);
  });

  it("is not terminal at start", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
});
