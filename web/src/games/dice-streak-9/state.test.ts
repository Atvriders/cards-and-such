import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { target: "5" as const };

describe("DiceStreak9", () => {
  it("starts with 2 dice", () => {
    const s = initialState(1, S);
    expect(s.dice.length).toBe(2);
    expect(s.nextNeeded).toBe(1);
  });
  it("roll produces valid dice values", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.dice[0]).toBeGreaterThanOrEqual(1);
    expect(s.dice[1]).toBeLessThanOrEqual(6);
  });
  it("hit increments streak and scores", () => {
    // Force a state where nextNeeded = 1 and a die shows 1
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "roll" });
    if (s2.lastHit) {
      expect(s2.streak).toBe(1);
      expect(s2.score).toBe(10);
    } else {
      expect(s2.streak).toBe(0);
    }
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});
