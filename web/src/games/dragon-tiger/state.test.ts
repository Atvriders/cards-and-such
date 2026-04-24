import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { handsPerSession: 20, bet: "10" as const };

describe("DragonTiger initialState", () => {
  it("starts with 1000 bankroll in betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.betChoice).toBeNull();
  });
});

describe("DragonTiger bet", () => {
  it("sets betChoice", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bet", on: "dragon" });
    expect(s2.betChoice).toBe("dragon");
  });

  it("can change bet choice", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bet", on: "dragon" });
    const s3 = reducer(s2, { type: "bet", on: "tiger" });
    expect(s3.betChoice).toBe("tiger");
  });
});

describe("DragonTiger deal", () => {
  it("cannot deal without bet", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("betting"); // unchanged
  });

  it("deals two cards and settles", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bet", on: "dragon" });
    const s3 = reducer(s2, { type: "deal" });
    expect(s3.phase).toBe("settled");
    expect(s3.dragonCard).not.toBeNull();
    expect(s3.tigerCard).not.toBeNull();
    expect(s3.handsPlayed).toBe(1);
  });

  it("deducts bet and may award winnings", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bet", on: "dragon" });
    const s3 = reducer(s2, { type: "deal" });
    // bankroll should be 990 (loss) or 1010 (win) or 995 (tie push)
    expect([990, 1010, 995]).toContain(s3.bankroll);
  });
});

describe("DragonTiger isTerminal", () => {
  it("terminal when session complete", () => {
    const s = initialState(42, defaultSettings);
    const end = { ...s, phase: "settled" as const, handsPlayed: 20, bankroll: 600 };
    expect(isTerminal(end)?.score).toBe(600);
  });

  it("not terminal early", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});
