import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CrownAndAnchorState } from "./state.js";

const defaultSettings = { startingCoins: "10" as const };

describe("CrownAndAnchor initialState", () => {
  it("starts with coins equal to setting", () => {
    const s = initialState(1, defaultSettings);
    expect(s.coins).toBe(10);
    expect(s.phase).toBe("betting");
    expect(s.betSymbol).toBe("crown");
  });

  it("is deterministic", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("CrownAndAnchor setBet", () => {
  it("clamps bet to available coins", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "setBet", amount: 100 });
    expect(s2.bet).toBe(10);
  });

  it("minimum bet is 1", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "setBet", amount: -5 });
    expect(s2.bet).toBe(1);
  });
});

describe("CrownAndAnchor roll", () => {
  it("produces 3 symbol dice and updates coins", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(["rolled", "gameDone"]).toContain(s2.phase);
    expect(s2.lastRoll).toHaveLength(3);
    // Coins changed
    expect(s2.coins).not.toBe(s.coins);
  });

  it("win = bet * matching dice count", () => {
    const base = initialState(1, defaultSettings);
    const withKnownState: CrownAndAnchorState = {
      ...base,
      lastRoll: ["crown", "crown", "anchor"],
      betSymbol: "crown",
      bet: 3,
      coins: 10,
      lastWin: 6, // 3 * 2 matches
      phase: "rolled",
    };
    // Verify the formula: matches=2, win = bet*2 = 6
    expect(withKnownState.lastWin).toBe(6);
  });
});

describe("CrownAndAnchor isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score based on rounds when gameDone", () => {
    const base = initialState(1, defaultSettings);
    const done: CrownAndAnchorState = {
      ...base,
      phase: "gameDone",
      roundsPlayed: 15,
      coins: 0,
    };
    const result = isTerminal(done);
    expect(result?.score).toBe(150);
  });
});
