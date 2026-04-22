import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeCategoryScore, isFlush, ALL_CATEGORIES } from "./state.js";
import type { Die } from "../../engines/dice/index.js";

const defaultSettings = { flushBonus: true };

function makeDice(values: [number, number, number, number, number]): Die[] {
  return values.map((v) => ({ value: v as Die["value"], kept: false }));
}

describe("Kismet initialState", () => {
  it("starts at round 1 with empty scores", () => {
    const s = initialState(10, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.rollsUsed).toBe(0);
    expect(s.scores).toEqual({});
  });

  it("is deterministic under same seed", () => {
    expect(initialState(99, defaultSettings)).toEqual(initialState(99, defaultSettings));
  });
});

describe("Kismet scoring categories", () => {
  it("Flush: all even dice → 35", () => {
    const dice = makeDice([2, 4, 6, 2, 4]);
    expect(isFlush(dice)).toBe(true);
    expect(computeCategoryScore(dice, "flush")).toBe(35);
  });

  it("Flush: mixed parity → 0", () => {
    const dice = makeDice([1, 2, 4, 6, 2]);
    expect(isFlush(dice)).toBe(false);
    expect(computeCategoryScore(dice, "flush")).toBe(0);
  });

  it("Two Pair scores 25 for two distinct pairs", () => {
    const dice = makeDice([3, 3, 5, 5, 2]);
    expect(computeCategoryScore(dice, "twoPair")).toBe(25);
  });

  it("Full House = sum + 15", () => {
    const dice = makeDice([2, 2, 2, 4, 4]);
    const expected = (2 + 2 + 2 + 4 + 4) + 15;
    expect(computeCategoryScore(dice, "fullHouse")).toBe(expected);
  });

  it("Four of a Kind = sum + 25", () => {
    const dice = makeDice([5, 5, 5, 5, 3]);
    const expected = (5 + 5 + 5 + 5 + 3) + 25;
    expect(computeCategoryScore(dice, "fourOfAKind")).toBe(expected);
  });

  it("Kismet (5-of-a-kind) = sum + 50", () => {
    const dice = makeDice([3, 3, 3, 3, 3]);
    const expected = 15 + 50;
    expect(computeCategoryScore(dice, "kismet")).toBe(expected);
  });

  it("Three of a Kind scores sum", () => {
    const dice = makeDice([4, 4, 4, 1, 2]);
    expect(computeCategoryScore(dice, "threeOfAKind")).toBe(15);
  });
});

describe("Kismet reducer", () => {
  it("rolls dice and increments rollsUsed", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsUsed).toBe(1);
    expect(s2.dice.length).toBe(5);
  });

  it("scores category and advances round", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    const s2 = reducer(s, { type: "score", category: "ones" });
    expect("ones" in s2.scores).toBe(true);
    expect(s2.round).toBe(2);
  });

  it("cannot roll more than 3 times", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    const dice3 = s.dice.map((d) => d.value);
    s = reducer(s, { type: "roll" });
    expect(s.dice.map((d) => d.value)).toEqual(dice3);
  });
});

describe("Kismet isTerminal", () => {
  it("null mid-game", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score after filling all 12 categories", () => {
    let s = initialState(1, defaultSettings);
    for (const cat of ALL_CATEGORIES) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score", category: cat });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});
