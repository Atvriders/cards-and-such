import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeCategoryScore, isCameroon, ALL_CATEGORIES } from "./state.js";
import type { Die } from "../../engines/dice/index.js";

const defaultSettings = { cameroonBonus: true };

function makeDice(values: [number, number, number, number, number]): Die[] {
  return values.map((v) => ({ value: v as Die["value"], kept: false }));
}

describe("Cameroon initialState", () => {
  it("starts at round 1 with 0 rolls used", () => {
    const s = initialState(42, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.rollsUsed).toBe(0);
    expect(s.scores).toEqual({});
  });

  it("is deterministic under the same seed", () => {
    expect(initialState(7, defaultSettings)).toEqual(initialState(7, defaultSettings));
  });
});

describe("Cameroon roll", () => {
  it("increments rollsUsed and fills dice", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsUsed).toBe(1);
    expect(s2.dice.length).toBe(5);
    s2.dice.forEach((d) => expect(d.value).toBeGreaterThanOrEqual(1));
  });

  it("does not roll a 4th time", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    const s4 = reducer(s, { type: "roll" });
    expect(s4.rollsUsed).toBe(3);
    expect(s4.dice).toEqual(s.dice);
  });

  it("is deterministic — same seed same result", () => {
    const s = initialState(55, defaultSettings);
    const a = reducer(s, { type: "roll" });
    const b = reducer(s, { type: "roll" });
    expect(a.dice.map((d) => d.value)).toEqual(b.dice.map((d) => d.value));
  });
});

describe("Cameroon scoring", () => {
  it("scores Full House correctly (30 pts)", () => {
    const dice = makeDice([3, 3, 3, 5, 5]);
    expect(computeCategoryScore(dice, "fullHouse")).toBe(30);
  });

  it("scores Poker (4-of-a-kind) correctly (40 pts)", () => {
    const dice = makeDice([4, 4, 4, 4, 2]);
    expect(computeCategoryScore(dice, "poker")).toBe(40);
  });

  it("scores Little Straight (15 pts)", () => {
    const dice = makeDice([1, 2, 3, 4, 5]);
    expect(computeCategoryScore(dice, "littleStraight")).toBe(15);
  });

  it("scores Big Straight (20 pts)", () => {
    const dice = makeDice([2, 3, 4, 5, 6]);
    expect(computeCategoryScore(dice, "bigStraight")).toBe(20);
  });

  it("isCameroon detects 5-of-a-kind", () => {
    expect(isCameroon(makeDice([6, 6, 6, 6, 6]))).toBe(true);
    expect(isCameroon(makeDice([1, 6, 6, 6, 6]))).toBe(false);
  });

  it("scores a category and advances to next round", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    const cat = ALL_CATEGORIES[0]!;
    const s2 = reducer(s, { type: "score", category: cat });
    expect(cat in s2.scores).toBe(true);
    expect(s2.round).toBe(2);
    expect(s2.rollsUsed).toBe(0);
  });

  it("cannot score same category twice", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    const cat = ALL_CATEGORIES[0]!;
    const s2 = reducer(s, { type: "score", category: cat });
    const s3 = reducer(s2, { type: "roll" });
    const s4 = reducer(s3, { type: "score", category: cat });
    expect(s4.round).toBe(s2.round); // Did not re-advance
  });
});

describe("Cameroon isTerminal", () => {
  it("returns null mid-game", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score once all 10 categories filled", () => {
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
