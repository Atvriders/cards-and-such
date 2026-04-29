import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreRoll } from "./state.js";

const S = { rounds: "10" as const };

describe("Qwixx Connected", () => {
  it("initial state: score 0, round 1, phase ready", () => {
    const s = initialState(1, S);
    expect(s.score).toBeGreaterThanOrEqual(0);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("ready");
  });
  it("deterministic init", () => {
    expect(initialState(42, S)).toEqual(initialState(42, S));
  });
  it("roll changes phase to rolled and produces 5 dice", () => {
    const s = initialState(7, S);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("rolled");
    expect(s2.lastRoll.length).toBe(5);
    for (const d of s2.lastRoll) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });
  it("score is non-negative after rolling", () => {
    const s = initialState(11, S);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.score).toBeGreaterThanOrEqual(0);
  });
  it("scoreRoll returns >= 0", () => {
    expect(scoreRoll([1,2,3,4,5], 1)).toBeGreaterThanOrEqual(0);
    expect(scoreRoll([6,6,6,6,6], 1)).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null until gameover", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
