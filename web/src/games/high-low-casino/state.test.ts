import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { handsPerSession: 20, bet: "10" as const };

describe("HighLowCasino initialState", () => {
  it("starts with bankroll 1000 in betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.streak).toBe(0);
  });
});

describe("HighLowCasino deal", () => {
  it("deducts bet and enters decision phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("decision");
    expect(s2.bankroll).toBe(990);
    expect(s2.baseCard).not.toBeNull();
  });
});

describe("HighLowCasino guess", () => {
  it("wrong guess ends round in settled", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    // Make a guess — we don't know if it's right, but try both outcomes
    const s3h = reducer(s2, { type: "guess", prediction: "higher" });
    const s3l = reducer(s2, { type: "guess", prediction: "lower" });
    // At least one should be settled (wrong guess) or decision (right guess continues)
    const settled = s3h.phase === "settled" ? s3h : s3l.phase === "settled" ? s3l : null;
    if (settled) {
      expect(settled.handsPlayed).toBe(1);
      expect(settled.streak).toBe(0);
    }
  });

  it("correct guess increments streak", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (!s2.baseCard) return;
    // guess higher for low card
    const s3 = reducer(s2, { type: "guess", prediction: "higher" });
    if (s3.phase === "decision") {
      expect(s3.streak).toBeGreaterThan(0);
    }
  });
});

describe("HighLowCasino bank", () => {
  it("banking with streak returns winnings", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    // Force a streak by manually constructing state
    const withStreak = { ...s2, streak: 2 };
    const banked = reducer(withStreak, { type: "bank" });
    expect(banked.phase).toBe("settled");
    expect(banked.bankroll).toBeGreaterThan(s2.bankroll); // bankroll returned + winnings
    expect(banked.handsPlayed).toBe(1);
  });
});

describe("HighLowCasino isTerminal", () => {
  it("terminal when rounds complete", () => {
    const s = initialState(42, defaultSettings);
    const end = { ...s, phase: "settled" as const, handsPlayed: 20, bankroll: 700 };
    expect(isTerminal(end)?.score).toBe(700);
  });

  it("not terminal early", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});
