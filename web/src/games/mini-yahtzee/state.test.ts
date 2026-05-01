import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeCategoryScore, totalScore, ALL_CATEGORIES } from "./state.js";
import type { MiniYahtzeeState, DieS } from "./state.js";

const S = { dummy: false };

describe("MiniYahtzee", () => {
  it("starts with rollsUsed=0, round=1, no scores", () => {
    const s = initialState(123, S);
    expect(s.rollsUsed).toBe(0);
    expect(s.round).toBe(1);
    expect(s.dice.length).toBe(5);
    expect(Object.keys(s.scores).length).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("roll increments rollsUsed and stops at 3", () => {
    let s = initialState(42, S);
    s = reducer(s, { type: "roll" });
    expect(s.rollsUsed).toBe(1);
    s = reducer(s, { type: "roll" });
    expect(s.rollsUsed).toBe(2);
    s = reducer(s, { type: "roll" });
    expect(s.rollsUsed).toBe(3);
    const after = reducer(s, { type: "roll" });
    expect(after.rollsUsed).toBe(3);
  });

  it("toggle keep flips a die's kept flag (after rolling)", () => {
    let s = initialState(7, S);
    s = reducer(s, { type: "roll" });
    expect(s.dice[0]!.kept).toBe(false);
    s = reducer(s, { type: "toggle", idx: 0 });
    expect(s.dice[0]!.kept).toBe(true);
  });

  it("computes Yahtzee category correctly", () => {
    const allFives: DieS[] = [
      { value: 5, kept: false }, { value: 5, kept: false }, { value: 5, kept: false },
      { value: 5, kept: false }, { value: 5, kept: false },
    ];
    expect(computeCategoryScore(allFives, "yahtzee")).toBe(50);
    expect(computeCategoryScore(allFives, "fives")).toBe(25);
    expect(computeCategoryScore(allFives, "chance")).toBe(25);
  });

  it("computes full house and straights", () => {
    const fh: DieS[] = [
      { value: 2, kept: false }, { value: 2, kept: false }, { value: 2, kept: false },
      { value: 5, kept: false }, { value: 5, kept: false },
    ];
    expect(computeCategoryScore(fh, "fullHouse")).toBe(25);
    const lg: DieS[] = [
      { value: 1, kept: false }, { value: 2, kept: false }, { value: 3, kept: false },
      { value: 4, kept: false }, { value: 5, kept: false },
    ];
    expect(computeCategoryScore(lg, "largeStraight")).toBe(40);
    expect(computeCategoryScore(lg, "smallStraight")).toBe(30);
  });

  it("upper bonus +35 once subtotal reaches 63", () => {
    // Score 21 in each of ones..sixes? Easier: hand-build scores reaching exactly 63 in upper.
    const scores = { ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 };
    expect(totalScore(scores)).toBe(3 + 6 + 9 + 12 + 15 + 18 + 35);
  });

  it("isTerminal becomes truthy when all 13 categories filled", () => {
    let s: MiniYahtzeeState = initialState(99, S);
    s = reducer(s, { type: "roll" });
    // Force-fill scoreboard manually by repeated scoring.
    for (const cat of ALL_CATEGORIES) {
      // Ensure rollsUsed > 0 each round (after 'score' it resets; we re-roll).
      if (s.rollsUsed === 0) s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score", category: cat });
    }
    expect(isTerminal(s)).not.toBeNull();
  });

  it("scoring without rolling is rejected", () => {
    const s = initialState(1, S);
    const after = reducer(s, { type: "score", category: "chance" });
    expect(after).toBe(s);
  });
});
