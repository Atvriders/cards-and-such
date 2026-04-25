import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DieFace } from "./state.js";

const defaultSettings = { rounds: "5" as const };

describe("initialState", () => {
  it("creates correct number of empty rounds", () => {
    const s = initialState(42, defaultSettings);
    expect(s.rounds).toHaveLength(5);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
    for (const r of s.rounds) {
      expect(r.prediction).toBeNull();
      expect(r.result).toBeNull();
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("reducer — predict", () => {
  it("sets prediction for current round", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "predict", face: 3 as DieFace });
    expect(s2.rounds[0]!.prediction).toBe(3);
  });

  it("cannot change prediction once set", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "predict", face: 3 as DieFace });
    const s3 = reducer(s2, { type: "predict", face: 6 as DieFace });
    expect(s3.rounds[0]!.prediction).toBe(3);
  });
});

describe("reducer — roll", () => {
  it("requires prediction before roll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rounds[0]!.result).toBeNull();
  });

  it("rolls die after prediction", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "predict", face: 1 as DieFace });
    const s3 = reducer(s2, { type: "roll" });
    expect(s3.rounds[0]!.result).toBeGreaterThanOrEqual(1);
    expect(s3.rounds[0]!.result).toBeLessThanOrEqual(6);
  });

  it("advances round on second roll action", () => {
    const s = initialState(42, defaultSettings);
    let state = reducer(s, { type: "predict", face: 1 as DieFace });
    state = reducer(state, { type: "roll" }); // shows result
    state = reducer(state, { type: "roll" }); // advances
    expect(state.currentRound).toBe(1);
  });

  it("is no-op after game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true };
    expect(reducer(over, { type: "roll" })).toBe(over);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true, score: 200 };
    expect(isTerminal(over)!.score).toBe(200);
  });

  it("correct prediction scores 100", () => {
    let s = initialState(42, defaultSettings);
    // Roll first to see what result would be, then predict it
    const preview = reducer(reducer(s, { type: "predict", face: 1 as DieFace }), { type: "roll" });
    const actualResult = preview.rounds[0]!.result as DieFace;
    // Now test from scratch with correct prediction
    s = initialState(42, defaultSettings);
    s = reducer(s, { type: "predict", face: actualResult });
    s = reducer(s, { type: "roll" });
    expect(s.score).toBe(100);
    expect(s.rounds[0]!.correct).toBe(true);
  });
});
