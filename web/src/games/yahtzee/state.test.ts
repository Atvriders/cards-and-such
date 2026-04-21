import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ALL_CATEGORIES, upperSectionSum, totalScore } from "./state.js";
import type { YahtzeeState } from "./state.js";

const defaultSettings = { strictYahtzeeBonus: true };

describe("Yahtzee initialState", () => {
  it("has 13 rounds, 0 rollsUsed, 5 dice", () => {
    const s = initialState(42, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.rollsUsed).toBe(0);
    expect(s.dice.length).toBe(5);
    expect(Object.keys(s.scores).length).toBe(0);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("Yahtzee roll action", () => {
  it("advances rollsUsed from 0 to 1 and produces deterministic dice", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsUsed).toBe(1);
    // All dice have valid values
    for (const die of s2.dice) {
      expect(die.value).toBeGreaterThanOrEqual(1);
      expect(die.value).toBeLessThanOrEqual(6);
    }
    // Deterministic
    const s3 = reducer(s, { type: "roll" });
    expect(s2.dice).toEqual(s3.dice);
  });

  it("does not roll when rollsUsed is already 3", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    expect(s.rollsUsed).toBe(3);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsUsed).toBe(3);
    expect(s2.dice).toEqual(s.dice);
  });

  it("only rerolls unkept dice on subsequent rolls", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    // Keep the first die
    s = reducer(s, { type: "toggleKeep", index: 0 });
    const keptValue = s.dice[0]!.value;
    s = reducer(s, { type: "roll" });
    expect(s.rollsUsed).toBe(2);
    expect(s.dice[0]!.kept).toBe(true);
    expect(s.dice[0]!.value).toBe(keptValue);
  });
});

describe("Yahtzee score action", () => {
  it("scores into 'ones' correctly", () => {
    // Build a state with known dice
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    // Manually set dice for predictable test
    const diceWith3Ones = s.dice.map((d, i) => ({
      ...d,
      value: (i < 3 ? 1 : 4) as 1 | 2 | 3 | 4 | 5 | 6,
    }));
    const stateWithDice: YahtzeeState = { ...s, dice: diceWith3Ones };
    const scored = reducer(stateWithDice, { type: "score", category: "ones" });
    // 3 ones = 3 points
    expect(scored.scores["ones"]).toBe(3);
    expect(scored.round).toBe(2);
    expect(scored.rollsUsed).toBe(0);
  });

  it("rejects scoring into an already-used category", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "score", category: "chance" });
    expect(s.round).toBe(2);
    // Roll again and try to score chance again
    s = reducer(s, { type: "roll" });
    const before = s.scores;
    const s2 = reducer(s, { type: "score", category: "chance" });
    // Should be unchanged (round should not advance)
    expect(s2.round).toBe(s.round);
    expect(s2.scores).toEqual(before);
  });

  it("rejects scoring if no roll has been made this round", () => {
    const s = initialState(42, defaultSettings);
    // Try to score without rolling
    const s2 = reducer(s, { type: "score", category: "ones" });
    expect(s2.round).toBe(1);
    expect(s2.rollsUsed).toBe(0);
    expect("ones" in s2.scores).toBe(false);
  });
});

describe("Yahtzee upper bonus", () => {
  it("awards 35 bonus when upper section sum >= 63", () => {
    // Simulate scores with upper sum = 63
    const scores = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18, // sum = 63
    };
    expect(upperSectionSum(scores)).toBe(63);
    const total = totalScore(scores);
    expect(total).toBe(63 + 35);
  });

  it("no bonus when upper section sum < 63", () => {
    const scores = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 17, // sum = 62
    };
    expect(upperSectionSum(scores)).toBe(62);
    expect(totalScore(scores)).toBe(62);
  });
});

describe("Yahtzee isTerminal", () => {
  it("returns null when not all categories are scored", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns {score} when all 13 categories are used", () => {
    let s = initialState(42, defaultSettings);
    for (const cat of ALL_CATEGORIES) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score", category: cat });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
    expect(result?.score).toBeGreaterThanOrEqual(0);
  });
});
