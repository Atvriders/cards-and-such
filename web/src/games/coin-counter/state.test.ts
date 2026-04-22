import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COIN_VALUE } from "./state.js";

const settings = { duration: "60" as const, difficulty: "easy" as const };

describe("CoinCounter initialState", () => {
  it("starts with full time", () => {
    const s = initialState(1, settings);
    expect(s.timeLeft).toBe(60);
  });

  it("starts with 0 correct and wrong", () => {
    const s = initialState(1, settings);
    expect(s.correct).toBe(0);
    expect(s.wrong).toBe(0);
  });

  it("answer matches coin values", () => {
    const s = initialState(1, settings);
    const expected = s.coins.reduce((sum, { coin, count }) => sum + COIN_VALUE[coin] * count, 0);
    expect(s.answer).toBe(expected);
  });

  it("phase starts as playing", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("playing");
  });
});

describe("CoinCounter reducer", () => {
  it("input updates userInput with digits only", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "input", value: "42" });
    expect(s2.userInput).toBe("42");
  });

  it("input strips non-digit characters", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "input", value: "12abc" });
    expect(s2.userInput).toBe("12");
  });

  it("correct submission increments correct count", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "input", value: String(s.answer) });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.correct).toBe(1);
    expect(s3.streak).toBe(1);
    expect(s3.lastResult).toBe("correct");
  });

  it("wrong submission increments wrong count and resets streak", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "input", value: "999" });
    const s3 = reducer(s2, { type: "submit" });
    // Only wrong if 999 != answer
    if (s.answer !== 999) {
      expect(s3.wrong).toBe(1);
      expect(s3.streak).toBe(0);
      expect(s3.lastResult).toBe("wrong");
    }
  });

  it("tick decrements timeLeft", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(59);
  });

  it("tick to 0 sets phase done", () => {
    const s = initialState(1, settings);
    const s2 = { ...s, timeLeft: 1 };
    const s3 = reducer(s2, { type: "tick" });
    expect(s3.phase).toBe("done");
  });
});

describe("CoinCounter isTerminal", () => {
  it("returns null while playing", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(1, settings);
    const done = { ...s, phase: "done" as const, correct: 5, wrong: 2 };
    expect(isTerminal(done)).toEqual({ score: 44 }); // 5*10 - 2*3
  });

  it("score cannot be negative", () => {
    const s = initialState(1, settings);
    const done = { ...s, phase: "done" as const, correct: 0, wrong: 10 };
    expect(isTerminal(done)!.score).toBeGreaterThanOrEqual(0);
  });

  it("COIN_VALUE values are correct", () => {
    expect(COIN_VALUE.penny).toBe(1);
    expect(COIN_VALUE.nickel).toBe(5);
    expect(COIN_VALUE.dime).toBe(10);
    expect(COIN_VALUE.quarter).toBe(25);
  });
});
