import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TARGET_SIXES } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("starts with zero rolls and zero sixes", () => {
    const s = initialState(42, settings);
    expect(s.rolls).toBe(0);
    expect(s.sixesRolled).toBe(0);
    expect(s.done).toBe(false);
    expect(s.lastDie).toBeNull();
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("reducer", () => {
  it("increments rolls on every roll action", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rolls).toBe(1);
    expect(s2.lastDie).toBeGreaterThanOrEqual(1);
    expect(s2.lastDie).toBeLessThanOrEqual(6);
  });

  it("is a no-op when done", () => {
    const s = { ...initialState(1, settings), done: true };
    const s2 = reducer(s, { type: "roll" });
    expect(s2).toBe(s);
  });

  it("seeds produce die values between 1 and 6", () => {
    let state = initialState(7, settings);
    for (let i = 0; i < 20; i++) {
      state = reducer(state, { type: "roll" });
      expect(state.lastDie).toBeGreaterThanOrEqual(1);
      expect(state.lastDie).toBeLessThanOrEqual(6);
    }
  });

  it("done becomes true after TARGET_SIXES sixes", () => {
    // Force state: set sixesRolled to TARGET_SIXES-1 and find a 6
    let state = initialState(42, settings);
    // Manually set sixes close to done
    state = { ...state, sixesRolled: TARGET_SIXES - 1 };
    // Roll until we get a six
    let iterations = 0;
    while (!state.done && iterations < 1000) {
      state = reducer(state, { type: "roll" });
      iterations++;
    }
    expect(state.done).toBe(true);
    expect(state.sixesRolled).toBe(TARGET_SIXES);
  });
});

describe("isTerminal", () => {
  it("returns null when not done", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("score = max(0, 100 - rolls)", () => {
    const s = { ...initialState(1, settings), done: true, rolls: 30 };
    expect(isTerminal(s)!.score).toBe(70);
  });

  it("score is 0 if rolls >= 100", () => {
    const s = { ...initialState(1, settings), done: true, rolls: 150 };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("perfect scenario: 10 rolls, 10 sixes → score 90", () => {
    const s = { ...initialState(1, settings), done: true, rolls: 10, sixesRolled: 10 };
    expect(isTerminal(s)!.score).toBe(90);
  });
});
