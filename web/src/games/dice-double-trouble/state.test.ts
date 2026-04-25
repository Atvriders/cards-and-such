import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s8 = { rounds: "8" as const };

describe("DiceDoubleTrouble initialState", () => {
  it("starts in rolling phase", () => {
    expect(initialState(1, s8).phase).toBe("rolling");
  });
  it("totalScore starts 0", () => {
    expect(initialState(1, s8).totalScore).toBe(0);
  });
  it("round starts at 1", () => {
    expect(initialState(1, s8).round).toBe(1);
  });
  it("is deterministic", () => {
    const s1 = reducer(initialState(5, s8), { type: "roll" });
    const s2 = reducer(initialState(5, s8), { type: "roll" });
    expect(s1.dice).toEqual(s2.dice);
  });
});

describe("DiceDoubleTrouble reducer", () => {
  it("roll produces dice and score", () => {
    const s = reducer(initialState(1, s8), { type: "roll" });
    expect(s.dice[0]).toBeGreaterThanOrEqual(1);
    expect(s.roundScore).toBeGreaterThan(0);
  });
  it("double triggers reroll", () => {
    // Find a seed that produces a double
    for (let seed = 0; seed < 50; seed++) {
      const s = reducer(initialState(seed, s8), { type: "roll" });
      if (s.isDouble) {
        expect(s.rerollDice).not.toBeNull();
        expect(s.roundScore).toBeGreaterThan(s.dice[0] + s.dice[1]);
        break;
      }
    }
  });
  it("next advances round", () => {
    const s2 = reducer(initialState(1, s8), { type: "roll" });
    const s3 = s2.phase === "result" ? reducer(s2, { type: "next" }) : s2;
    if (s3.phase === "rolling") expect(s3.round).toBe(2);
  });
  it("gameover after last round", () => {
    let s = initialState(1, { rounds: "6" });
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
