import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { GoingToBostonState } from "./state.js";

const defaultSettings = { rounds: "3" as const };

describe("GoingToBoston initialState", () => {
  it("starts at round 1, preRoll phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("preRoll");
    expect(s.totalScore).toBe(0);
    expect(s.keptDice).toHaveLength(0);
  });

  it("totalRounds matches settings", () => {
    const s = initialState(1, { rounds: "5" });
    expect(s.totalRounds).toBe(5);
  });
});

describe("GoingToBoston roll", () => {
  it("first roll produces 3 dice and keeps the max", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("kept1");
    expect(s2.keptDice).toHaveLength(1);
    expect(s2.currentRoll).toHaveLength(2);
    // Kept die should be max of original 3
    const allDice = [...s2.keptDice, ...s2.currentRoll];
    expect(s2.keptDice[0]).toBeGreaterThanOrEqual(Math.max(...s2.currentRoll));
  });

  it("second roll keeps best of 2", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "roll" });
    expect(s3.phase).toBe("kept2");
    expect(s3.keptDice).toHaveLength(2);
  });

  it("third roll completes the round", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "roll" });
    const s4 = reducer(s3, { type: "roll" });
    expect(["roundDone", "gameDone"]).toContain(s4.phase);
    expect(s4.keptDice).toHaveLength(3);
    expect(s4.roundScore).toBe(s4.keptDice.reduce((a, b) => a + b, 0));
  });
});

describe("GoingToBoston nextRound", () => {
  it("advances to next round after roundDone", () => {
    const base = initialState(1, defaultSettings);
    const ready: GoingToBostonState = {
      ...base,
      phase: "roundDone",
      round: 1,
      roundScore: 12,
      totalScore: 12,
      keptDice: [4, 4, 4],
    };
    const s2 = reducer(ready, { type: "nextRound" });
    expect(s2.round).toBe(2);
    expect(s2.phase).toBe("preRoll");
    expect(s2.keptDice).toHaveLength(0);
  });
});

describe("GoingToBoston isTerminal", () => {
  it("returns null when game not done", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when gameDone", () => {
    const base = initialState(1, defaultSettings);
    const done: GoingToBostonState = {
      ...base,
      phase: "gameDone",
      totalScore: 42,
    };
    const result = isTerminal(done);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(42);
  });
});
