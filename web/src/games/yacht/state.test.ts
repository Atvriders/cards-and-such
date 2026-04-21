import { describe, it, expect } from "vitest";
import {
  initialState, reducer, isTerminal, ALL_YACHT_CATEGORIES,
  computeYachtScore, totalYachtScore,
} from "./state.js";
import type { YachtState } from "./state.js";

const settings = { dummy: false };

describe("Yacht initialState", () => {
  it("starts at round 1 with 5 dice and no scores", () => {
    const s = initialState(42, settings);
    expect(s.round).toBe(1);
    expect(s.rollsUsed).toBe(0);
    expect(s.dice.length).toBe(5);
    expect(Object.keys(s.scores).length).toBe(0);
  });

  it("is deterministic under the same seed", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("Yacht scoring", () => {
  it("scores yacht (5 of a kind) as 50", () => {
    const dice = Array.from({ length: 5 }, () => ({ value: 3 as const, kept: false }));
    expect(computeYachtScore(dice, "yacht")).toBe(50);
  });

  it("scores little straight (1-2-3-4-5) as 30", () => {
    const dice = [1,2,3,4,5].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeYachtScore(dice, "littleStraight")).toBe(30);
  });

  it("scores big straight (2-3-4-5-6) as 30", () => {
    const dice = [2,3,4,5,6].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeYachtScore(dice, "bigStraight")).toBe(30);
  });

  it("scores full house as sum of all dice", () => {
    const dice = [3,3,3,2,2].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeYachtScore(dice, "fullHouse")).toBe(13);
  });

  it("scores four of a kind as sum of all dice", () => {
    const dice = [4,4,4,4,2].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeYachtScore(dice, "fourOfAKind")).toBe(18);
  });

  it("scores choice as sum of all dice", () => {
    const dice = [1,2,3,4,5].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeYachtScore(dice, "choice")).toBe(15);
  });

  it("returns 0 for yacht when not 5 of a kind", () => {
    const dice = [3,3,3,3,2].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeYachtScore(dice, "yacht")).toBe(0);
  });
});

describe("Yacht roll/score flow", () => {
  it("rolls dice and advances rollsUsed", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsUsed).toBe(1);
    expect(s2.dice.every((d) => d.value >= 1 && d.value <= 6)).toBe(true);
  });

  it("cannot roll more than 3 times", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    const before = s.dice;
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice).toEqual(before);
  });

  it("cannot score without rolling first", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "score", category: "choice" });
    expect(s2.round).toBe(1);
    expect("choice" in s2.scores).toBe(false);
  });

  it("cannot score same category twice", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "score", category: "choice" });
    s = reducer(s, { type: "roll" });
    const before = s.scores;
    const s2 = reducer(s, { type: "score", category: "choice" });
    expect(s2.scores).toEqual(before);
  });
});

describe("Yacht isTerminal", () => {
  it("returns null when not all categories scored", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score after all 12 categories filled", () => {
    let s = initialState(42, settings);
    for (const cat of ALL_YACHT_CATEGORIES) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score", category: cat });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
  });

  it("totalYachtScore sums all categories", () => {
    const scores = { ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 };
    expect(totalYachtScore(scores)).toBe(63);
  });
});
