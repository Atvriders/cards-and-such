import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcCategory, TOTAL_ROUNDS } from "./state.js";

describe("Dice Stack", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.round).toBe(1);
    expect(s.dice.length).toBe(5);
    expect(s.rollsLeft).toBe(3);
    expect(s.phase).toBe("roll");
    expect(s.totalScore).toBe(0);
  });

  it("roll transitions from roll to keep phase", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("keep");
    expect(s2.rollsLeft).toBe(2);
  });

  it("toggleKeep toggles dice kept status", () => {
    const s = { ...initialState(42), phase: "keep" as const };
    const s2 = reducer(s, { type: "toggleKeep", idx: 2 });
    expect(s2.kept[2]).toBe(true);
    const s3 = reducer(s2, { type: "toggleKeep", idx: 2 });
    expect(s3.kept[2]).toBe(false);
  });

  it("calcCategory: chance sums all dice", () => {
    expect(calcCategory("chance", [1, 2, 3, 4, 5])).toBe(15);
  });

  it("calcCategory: full house scores 25", () => {
    expect(calcCategory("fullHouse", [1, 1, 1, 2, 2])).toBe(25);
  });

  it("calcCategory: large straight scores 40", () => {
    expect(calcCategory("largeStraight", [1, 2, 3, 4, 5])).toBe(40);
    expect(calcCategory("largeStraight", [2, 3, 4, 5, 6])).toBe(40);
    expect(calcCategory("largeStraight", [1, 2, 3, 4, 6])).toBe(0);
  });

  it("calcCategory: stack (yahtzee) scores 50", () => {
    expect(calcCategory("stack", [3, 3, 3, 3, 3])).toBe(50);
    expect(calcCategory("stack", [1, 2, 3, 3, 3])).toBe(0);
  });

  it("isTerminal null when not done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("scoring a category advances the round", () => {
    const s = { ...initialState(42), phase: "keep" as const, dice: [1, 1, 1, 1, 1] };
    const s2 = reducer(s, { type: "scoreCategory", category: "ones" });
    expect(s2.round).toBe(2);
    expect(s2.totalScore).toBe(5);
  });

  it("completes after scoring all categories", () => {
    let s = initialState(42);
    const cats = ["ones", "twos", "threes", "fours", "fives", "sixes",
      "threeOfKind", "fourOfKind", "fullHouse", "smallStraight", "largeStraight", "stack", "chance"];
    for (const cat of cats) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "scoreCategory", category: cat });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
