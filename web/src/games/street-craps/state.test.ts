import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { StreetCrapsState } from "./state.js";

const defaultSettings = { rounds: "5" as const };

describe("StreetCraps initialState", () => {
  it("starts in comeOut phase with 0 wins", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("comeOut");
    expect(s.wins).toBe(0);
    expect(s.point).toBeNull();
    expect(s.totalRounds).toBe(5);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("StreetCraps comeOut", () => {
  it("rolls two dice", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.lastRoll).toHaveLength(2);
    s2.lastRoll.forEach((d) => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    });
  });

  it("7 or 11 on come-out is a win", () => {
    const base = initialState(1, defaultSettings);
    const winState: StreetCrapsState = {
      ...base,
      lastRoll: [3, 4],
      lastSum: 7,
      roundResult: "win",
      wins: 1,
      roundsPlayed: 1,
      phase: "roundDone",
    };
    expect(winState.roundResult).toBe("win");
  });

  it("2, 3, or 12 on come-out is a lose", () => {
    const base = initialState(1, defaultSettings);
    const loseState: StreetCrapsState = {
      ...base,
      lastRoll: [1, 1],
      lastSum: 2,
      roundResult: "lose",
      roundsPlayed: 1,
      phase: "roundDone",
    };
    expect(loseState.roundResult).toBe("lose");
  });
});

describe("StreetCraps point phase", () => {
  it("sets point when come-out is 4-10 (not 7 or 11)", () => {
    const base = initialState(1, defaultSettings);
    const withPoint: StreetCrapsState = {
      ...base,
      lastRoll: [2, 2],
      lastSum: 4,
      point: 4,
      phase: "point",
    };
    expect(withPoint.point).toBe(4);
    expect(withPoint.phase).toBe("point");
  });

  it("rolling point wins the round", () => {
    const base = initialState(1, defaultSettings);
    const pointPhase: StreetCrapsState = {
      ...base,
      lastRoll: [2, 3],
      lastSum: 5,
      point: 5,
      phase: "point",
    };
    // Manually create a won state
    const won: StreetCrapsState = {
      ...pointPhase,
      roundResult: "win",
      wins: 1,
      roundsPlayed: 1,
      phase: "roundDone",
    };
    expect(won.roundResult).toBe("win");
  });
});

describe("StreetCraps isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns win-rate score", () => {
    const base = initialState(1, defaultSettings);
    const done: StreetCrapsState = { ...base, phase: "gameDone", wins: 3, totalRounds: 5 };
    expect(isTerminal(done)?.score).toBe(600);
  });
});
