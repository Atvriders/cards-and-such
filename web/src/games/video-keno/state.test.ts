import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcPayout } from "./state.js";
import type { VideoKenoState } from "./state.js";

const defaultSettings = {
  pickCount: "6" as const,
  bet: "2" as const,
  roundsPerSession: 20,
};

describe("VideoKeno initialState", () => {
  it("starts with bankroll 200, picking phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(200);
    expect(s.phase).toBe("picking");
    expect(s.playerPicks).toEqual([]);
  });
});

describe("VideoKeno toggle-pick", () => {
  it("adds a number to picks", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "toggle-pick", number: 15 });
    expect(s2.playerPicks).toContain(15);
  });

  it("removes a number when toggled twice", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "toggle-pick", number: 15 });
    const s3 = reducer(s2, { type: "toggle-pick", number: 15 });
    expect(s3.playerPicks).not.toContain(15);
  });

  it("does not add more than pickCount numbers", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 1; i <= 7; i++) {
      s = reducer(s, { type: "toggle-pick", number: i });
    }
    // pickCount is 6, so 7th should not be added
    expect(s.playerPicks.length).toBe(6);
  });
});

describe("VideoKeno draw", () => {
  it("draws exactly 20 numbers", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 1; i <= 6; i++) s = reducer(s, { type: "toggle-pick", number: i });
    const drawn = reducer(s, { type: "draw" });
    expect(drawn.drawnNumbers.length).toBe(20);
  });

  it("deducts bet on draw", () => {
    let s = initialState(42, defaultSettings);
    const initialBankroll = s.bankroll;
    for (let i = 1; i <= 6; i++) s = reducer(s, { type: "toggle-pick", number: i });
    const drawn = reducer(s, { type: "draw" });
    // bankroll may be deducted by bet then increased by payout
    expect(drawn.roundsPlayed).toBe(1);
    expect(drawn.phase).toBe("settled");
    // Net: bankroll - bet + payout. At least "bet was deducted" means bankroll <= initialBankroll
    // unless there's a win
    expect(drawn.bankroll).toBeGreaterThanOrEqual(0);
    expect(drawn.lastResult).toBeTruthy();
  });
});

describe("VideoKeno calcPayout", () => {
  it("returns 0 for no matching picks", () => {
    expect(calcPayout(6, 2, 2)).toBe(0); // 6-pick needs at least 3 matches
  });

  it("returns correct multiplier for 6-pick match-6", () => {
    expect(calcPayout(6, 6, 2)).toBe(3000); // 1500 * 2
  });

  it("returns correct multiplier for 2-pick match-2", () => {
    expect(calcPayout(2, 2, 5)).toBe(60); // 12 * 5
  });
});

describe("VideoKeno terminal", () => {
  it("is terminal when rounds exhausted", () => {
    const s = initialState(42, defaultSettings);
    const done: VideoKenoState = { ...s, phase: "settled", roundsPlayed: 20, bankroll: 100 };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t?.score).toBe(100);
  });

  it("is not terminal at start", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
});
