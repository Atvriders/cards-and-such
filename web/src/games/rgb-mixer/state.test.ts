import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "3" as const };

describe("initialState", () => {
  it("starts at midpoint (128,128,128)", () => {
    const s = initialState(42, defaultSettings);
    expect(s.r).toBe(128);
    expect(s.g).toBe(128);
    expect(s.b).toBe(128);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
    expect(s.totalRounds).toBe(3);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(55, defaultSettings);
    const s2 = initialState(55, defaultSettings);
    expect(s1.targetR).toBe(s2.targetR);
  });
});

describe("reducer — channel adjustments", () => {
  it("setR updates R channel", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "setR", value: 200 });
    expect(s2.r).toBe(200);
    expect(s2.g).toBe(128);
  });

  it("clamps channel to 0-255", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "setR", value: 999 });
    expect(s2.r).toBe(255);
    const s3 = reducer(s, { type: "setG", value: -10 });
    expect(s3.g).toBe(0);
  });

  it("does not allow adjustment after submit", () => {
    const s = initialState(42, defaultSettings);
    const submitted = reducer(s, { type: "submit" });
    expect(submitted.locked).toBe(true);
    const s2 = reducer(submitted, { type: "setR", value: 0 });
    expect(s2.r).toBe(submitted.r); // unchanged
  });
});

describe("reducer — submit", () => {
  it("first submit locks and scores", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.locked).toBe(true);
    expect(s2.roundScores).toHaveLength(1);
    expect(s2.score).toBeGreaterThanOrEqual(0);
  });

  it("second submit advances round", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "submit" }); // lock
    const s3 = reducer(s2, { type: "submit" }); // advance
    expect(s3.currentRound).toBe(1);
    expect(s3.locked).toBe(false);
    expect(s3.r).toBe(128);
  });

  it("game over after all rounds", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "submit" }); // lock
      if (!s.gameOver) s = reducer(s, { type: "submit" }); // advance
    }
    expect(s.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true, score: 2500 };
    expect(isTerminal(over)!.score).toBe(2500);
  });
});
