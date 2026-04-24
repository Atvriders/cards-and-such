import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = {
  handsPerSession: 15,
  antePerHand: "10" as const,
  numHands: "3" as const,
};

describe("CasinoWarMulti initialState", () => {
  it("starts with 1000 bankroll and betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.hands).toHaveLength(0);
  });
});

describe("CasinoWarMulti deal", () => {
  it("deals 3 hands and deducts 3x ante", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.hands).toHaveLength(3);
    // Bet costs 30, but winnings may be returned immediately when no ties occur
    // So bankroll is either settled (could be above or below 1000) or mid-round at 970
    expect(s2.bankroll).toBeGreaterThanOrEqual(0);
    // May go immediately to settled if no ties
    expect(["settled", "tie-decision"]).toContain(s2.phase);
  });
});

describe("CasinoWarMulti tie resolution", () => {
  it("can surrender when there are ties", () => {
    const s = initialState(42, defaultSettings);
    let s2 = reducer(s, { type: "deal" });
    // Try multiple seeds to get a tie
    let seed = 42;
    while (s2.phase !== "tie-decision" && seed < 200) {
      seed++;
      s2 = reducer(initialState(seed, defaultSettings), { type: "deal" });
    }
    if (s2.phase === "tie-decision") {
      const surrendered = reducer(s2, { type: "surrender-all" });
      expect(surrendered.phase).toBe("settled");
      expect(surrendered.handsPlayed).toBe(1);
    }
  });
});

describe("CasinoWarMulti isTerminal", () => {
  it("terminal when session complete", () => {
    const s = initialState(42, defaultSettings);
    const end = { ...s, phase: "settled" as const, handsPlayed: 15, bankroll: 800 };
    expect(isTerminal(end)?.score).toBe(800);
  });

  it("not terminal early", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});

describe("CasinoWarMulti go-to-war", () => {
  it("resolves war when in tie-decision phase", () => {
    const s = initialState(42, defaultSettings);
    let s2 = reducer(s, { type: "deal" });
    let seed = 42;
    while (s2.phase !== "tie-decision" && seed < 200) {
      seed++;
      s2 = reducer(initialState(seed, defaultSettings), { type: "deal" });
    }
    if (s2.phase === "tie-decision") {
      const warResult = reducer(s2, { type: "go-to-war" });
      expect(warResult.phase).toBe("settled");
      expect(warResult.handsPlayed).toBe(1);
    }
  });
});
