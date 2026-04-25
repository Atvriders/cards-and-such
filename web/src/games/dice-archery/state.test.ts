import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("DiceArchery initialState", () => {
  it("starts with 6 arrows and score 0", () => {
    const s = initialState(42);
    expect(s.arrowsRemaining).toBe(6);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(99)).toEqual(initialState(99));
  });
});

describe("DiceArchery shoot", () => {
  it("decreases arrows by 1 per shot", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.arrowsRemaining).toBe(5);
  });

  it("produces a roll with valid dice values", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.lastRoll).not.toBeNull();
    expect(s2.lastRoll![0]).toBeGreaterThanOrEqual(1);
    expect(s2.lastRoll![1]).toBeGreaterThanOrEqual(1);
    expect(s2.lastRoll![0]).toBeLessThanOrEqual(6);
    expect(s2.lastRoll![1]).toBeLessThanOrEqual(6);
  });

  it("ends game after 6 shots", () => {
    let s = initialState(1);
    for (let i = 0; i < 6; i++) s = reducer(s, { type: "shoot" });
    expect(s.gameOver).toBe(true);
    expect(s.arrowsRemaining).toBe(0);
  });

  it("ring equals absolute difference of dice", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "shoot" });
    const [d1, d2] = s2.lastRoll!;
    const expectedRing = Math.min(Math.abs(d1 - d2), 5);
    expect(s2.lastRing).toBe(expectedRing);
  });
});

describe("DiceArchery isTerminal", () => {
  it("returns null while arrows remain", () => {
    expect(isTerminal(initialState(5))).toBeNull();
  });

  it("returns score when game over", () => {
    let s = initialState(1);
    for (let i = 0; i < 6; i++) s = reducer(s, { type: "shoot" });
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(600);
  });
});
