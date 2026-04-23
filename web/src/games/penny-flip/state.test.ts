import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_FLIPS } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("starts with zero flips and correct count", () => {
    const s = initialState(42, settings);
    expect(s.flipsCompleted).toBe(0);
    expect(s.correct).toBe(0);
    expect(s.done).toBe(false);
    expect(s.totalFlips).toBe(TOTAL_FLIPS);
    expect(s.history).toHaveLength(0);
  });
});

describe("reducer — predict + flip", () => {
  it("sets pendingPrediction", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "predict", side: "heads" });
    expect(s2.pendingPrediction).toBe("heads");
  });

  it("does not override existing prediction", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "predict", side: "heads" });
    const s3 = reducer(s2, { type: "predict", side: "tails" });
    expect(s3.pendingPrediction).toBe("heads");
  });

  it("flip records history entry and advances", () => {
    const s = initialState(7, settings);
    const s2 = reducer(reducer(s, { type: "predict", side: "heads" }), { type: "flip" });
    expect(s2.history).toHaveLength(1);
    expect(s2.flipsCompleted).toBe(1);
    expect(s2.pendingPrediction).toBeNull();
    expect(["heads", "tails"]).toContain(s2.history[0]!.result);
  });

  it("game ends after TOTAL_FLIPS flips, never before", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < TOTAL_FLIPS; i++) {
      expect(s.done).toBe(false);
      s = reducer(s, { type: "predict", side: "heads" });
      s = reducer(s, { type: "flip" });
    }
    expect(s.done).toBe(true);
    expect(s.flipsCompleted).toBe(TOTAL_FLIPS);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("score = correct * 5", () => {
    const s = { ...initialState(1, settings), done: true, correct: 14 };
    expect(isTerminal(s)!.score).toBe(70);
  });

  it("perfect score = 100", () => {
    const s = { ...initialState(1, settings), done: true, correct: 20 };
    expect(isTerminal(s)!.score).toBe(100);
  });

  it("zero correct = 0", () => {
    const s = { ...initialState(1, settings), done: true, correct: 0 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
