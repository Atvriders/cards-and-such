import { describe, it, expect } from "vitest";
import {
  initialState, reducer, isTerminal, ALL_BALUT_CATEGORIES,
  computeBalutScore, totalBalutScore,
} from "./state.js";

const settings = { dummy: false };

describe("Balut initialState", () => {
  it("starts at round 1 with 5 dice, no scores, no balutBonus", () => {
    const s = initialState(42, settings);
    expect(s.round).toBe(1);
    expect(s.rollsUsed).toBe(0);
    expect(s.dice.length).toBe(5);
    expect(s.balutBonus).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(99, settings)).toEqual(initialState(99, settings));
  });
});

describe("Balut scoring", () => {
  it("scores balut (5 of a kind) as sum of all dice", () => {
    const dice = Array.from({ length: 5 }, () => ({ value: 4 as const, kept: false }));
    expect(computeBalutScore(dice, "balut")).toBe(20);
  });

  it("scores straight 1-2-3-4-5 as 25", () => {
    const dice = [1,2,3,4,5].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeBalutScore(dice, "straight")).toBe(25);
  });

  it("scores straight 2-3-4-5-6 as 25", () => {
    const dice = [2,3,4,5,6].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeBalutScore(dice, "straight")).toBe(25);
  });

  it("scores full house as sum of all dice", () => {
    const dice = [5,5,5,3,3].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeBalutScore(dice, "fullHouse")).toBe(21);
  });

  it("scores fours as sum of 4s", () => {
    const dice = [4,4,4,2,3].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeBalutScore(dice, "fours")).toBe(12);
  });
});

describe("Balut totalBalutScore", () => {
  it("adds 20 bonus when balut scored", () => {
    const scores = { fours: 8, fives: 10, sixes: 18, straight: 25, fullHouse: 15, choice: 20, balut: 20 };
    expect(totalBalutScore(scores, true)).toBe(116 + 20);
  });

  it("no bonus when balut not scored", () => {
    const scores = { fours: 8, fives: 10, sixes: 18, straight: 25, fullHouse: 15, choice: 20, balut: 0 };
    expect(totalBalutScore(scores, false)).toBe(96);
  });
});

describe("Balut roll/score flow", () => {
  it("advances rollsUsed on roll", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsUsed).toBe(1);
  });

  it("cannot score without rolling", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "score", category: "choice" });
    expect("choice" in s2.scores).toBe(false);
  });

  it("sets balutBonus when 5 of a kind scored in balut category", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" });
    // Override dice to be 5 of a kind
    const fiveOnes = s.dice.map(() => ({ value: 1 as const, kept: false }));
    const s2 = reducer({ ...s, dice: fiveOnes }, { type: "score", category: "balut" });
    expect(s2.balutBonus).toBe(true);
    expect(s2.scores["balut"]).toBe(5);
  });

  it("isTerminal returns null when incomplete", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score after all categories filled", () => {
    let s = initialState(42, settings);
    for (const cat of ALL_BALUT_CATEGORIES) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score", category: cat });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
