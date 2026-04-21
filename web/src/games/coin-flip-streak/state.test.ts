import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { maxFlips: "5" as const };

describe("initialState", () => {
  it("starts at zero streak, no history", () => {
    const s = initialState(42, defaultSettings);
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(0);
    expect(s.history.length).toBe(0);
    expect(s.gameOver).toBe(false);
    expect(s.maxFlips).toBe(5);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("reducer — predict", () => {
  it("sets pending prediction", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "predict", side: "heads" });
    expect(s2.pendingPrediction).toBe("heads");
  });

  it("does not change prediction once set", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "predict", side: "heads" });
    const s3 = reducer(s2, { type: "predict", side: "tails" });
    expect(s3.pendingPrediction).toBe("heads"); // unchanged
  });
});

describe("reducer — flip", () => {
  it("requires prediction before flip", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "flip" });
    expect(s2).toBe(s); // no-op
  });

  it("records flip result in history", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(reducer(s, { type: "predict", side: "heads" }), { type: "flip" });
    expect(s2.history.length).toBe(1);
    expect(["heads", "tails"]).toContain(s2.history[0]!.result);
    expect(s2.pendingPrediction).toBeNull();
  });

  it("streak increments on correct prediction", () => {
    // Find which side the first flip gives
    const s = initialState(42, defaultSettings);
    const predicted = "heads";
    const s2 = reducer(reducer(s, { type: "predict", side: predicted }), { type: "flip" });
    if (s2.history[0]!.result === predicted) {
      expect(s2.streak).toBe(1);
    } else {
      expect(s2.streak).toBe(0);
      expect(s2.gameOver).toBe(true);
    }
  });

  it("game ends on wrong prediction", () => {
    const s = initialState(42, defaultSettings);
    // Determine actual first flip result
    const s2 = reducer(reducer(s, { type: "predict", side: "heads" }), { type: "flip" });
    if (!s2.history[0]!.correct) {
      expect(s2.gameOver).toBe(true);
    }
    // Also test the inverse
    const s3 = reducer(reducer(s, { type: "predict", side: "tails" }), { type: "flip" });
    if (!s3.history[0]!.correct) {
      expect(s3.gameOver).toBe(true);
    }
  });

  it("is no-op after game over", () => {
    const s = initialState(42, defaultSettings);
    let state = s;
    // Force a loss
    state = reducer(reducer(s, { type: "predict", side: "heads" }), { type: "flip" });
    if (!state.gameOver) {
      state = { ...state, gameOver: true };
    }
    const prev = state;
    state = reducer(state, { type: "flip" });
    expect(state).toBe(prev);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("score = bestStreak * 100", () => {
    const s = initialState(42, defaultSettings);
    const done = { ...s, gameOver: true, bestStreak: 3 };
    expect(isTerminal(done)!.score).toBe(300);
  });

  it("score = 0 for zero streak", () => {
    const s = initialState(42, defaultSettings);
    const done = { ...s, gameOver: true, bestStreak: 0 };
    expect(isTerminal(done)!.score).toBe(0);
  });

  it("full run scores maxFlips * 100", () => {
    const s = initialState(42, defaultSettings);
    const won = { ...s, gameOver: true, won: true, bestStreak: s.maxFlips };
    expect(isTerminal(won)!.score).toBe(s.maxFlips * 100);
  });
});
