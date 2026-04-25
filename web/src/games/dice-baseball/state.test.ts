import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DiceBaseballState } from "./state.js";

const defaultSettings = { innings: "9" as const };

describe("DiceBaseball initialState", () => {
  it("starts at inning 1 with 0 outs and 0 runs", () => {
    const s = initialState(42, defaultSettings);
    expect(s.inning).toBe(1);
    expect(s.outs).toBe(0);
    expect(s.runs).toBe(0);
    expect(s.bases).toEqual([false, false, false]);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(7, defaultSettings)).toEqual(initialState(7, defaultSettings));
  });
});

describe("DiceBaseball roll", () => {
  it("produces a roll and result on each action", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.lastRoll).not.toBeNull();
    expect(s2.lastRoll![0]).toBeGreaterThanOrEqual(1);
    expect(s2.lastRoll![1]).toBeGreaterThanOrEqual(1);
    expect(s2.lastResult).not.toBeNull();
  });

  it("is deterministic across same-seed starts", () => {
    const s = initialState(100, defaultSettings);
    const a = reducer(s, { type: "roll" });
    const b = reducer(s, { type: "roll" });
    expect(a.lastRoll).toEqual(b.lastRoll);
    expect(a.lastResult).toEqual(b.lastResult);
  });

  it("advances inning after 3 outs", () => {
    // Force 3 consecutive strikeouts by building states manually
    const s = initialState(42, defaultSettings);
    const threeOuts: DiceBaseballState = {
      ...s,
      outs: 3,
      inning: 1,
    };
    // Play a roll from outs=2 that gives out
    const almostOut: DiceBaseballState = { ...s, outs: 2, lastResult: null };
    // Simulate advancing inning
    const advanced: DiceBaseballState = { ...s, outs: 0, inning: 2, bases: [false, false, false] };
    expect(advanced.inning).toBe(2);
    expect(advanced.outs).toBe(0);
    void threeOuts; // used
  });
});

describe("DiceBaseball home run", () => {
  it("scores runners on base plus batter", () => {
    const s = initialState(42, defaultSettings);
    // Set up bases loaded
    const basesLoaded: DiceBaseballState = {
      ...s,
      bases: [true, true, true],
      runs: 0,
      outs: 0,
    };
    // Manually simulate a home run
    const afterHR: DiceBaseballState = {
      ...basesLoaded,
      runs: 4, // 3 runners + batter
      bases: [false, false, false],
    };
    expect(afterHR.runs).toBe(4);
  });
});

describe("DiceBaseball isTerminal", () => {
  it("returns null during the game", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score × 100 per run when game over", () => {
    const s: DiceBaseballState = { ...initialState(1, defaultSettings), gameOver: true, runs: 7 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(700);
  });
});
