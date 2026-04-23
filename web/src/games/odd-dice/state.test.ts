import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, sumOdds, DICE_COUNT, ROLLS_PER_ROUND } from "./state.js";

const settings3 = { rounds: "3" as const };
const settings5 = { rounds: "5" as const };

describe("initialState", () => {
  it("has empty dice and correct rounds", () => {
    const s = initialState(42, settings3);
    expect(s.dice).toHaveLength(0);
    expect(s.totalRounds).toBe(3);
    expect(s.rollsLeft).toBe(ROLLS_PER_ROUND);
    expect(s.done).toBe(false);
  });

  it("respects rounds setting", () => {
    const s = initialState(1, settings5);
    expect(s.totalRounds).toBe(5);
  });
});

describe("sumOdds", () => {
  it("sums only odd dice", () => {
    expect(sumOdds([1, 2, 3, 4, 5])).toBe(9); // 1+3+5
    expect(sumOdds([2, 4, 6])).toBe(0);
    expect(sumOdds([1, 1, 1])).toBe(3);
  });
});

describe("reducer — roll", () => {
  it("sets dice and decrements rollsLeft", () => {
    const s = initialState(7, settings3);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice).toHaveLength(DICE_COUNT);
    expect(s2.rollsLeft).toBe(ROLLS_PER_ROUND - 1);
    expect(s2.dice.every((d) => d >= 1 && d <= 6)).toBe(true);
  });

  it("no-op when rollsLeft is 0", () => {
    const s = { ...initialState(1, settings3), rollsLeft: 0, dice: [1, 2, 3, 4, 5] };
    const s2 = reducer(s, { type: "roll" });
    expect(s2).toBe(s);
  });

  it("roundScore equals sumOdds of dice", () => {
    const s = initialState(42, settings3);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.roundScore).toBe(sumOdds(s2.dice));
  });
});

describe("reducer — endRound", () => {
  it("adds roundScore to totalScore and advances round", () => {
    const s = { ...initialState(1, settings3), dice: [1, 2, 3, 4, 5], roundScore: 9 };
    const s2 = reducer(s, { type: "endRound" });
    expect(s2.totalScore).toBe(9);
    expect(s2.round).toBe(2);
    expect(s2.dice).toHaveLength(0);
    expect(s2.rollsLeft).toBe(ROLLS_PER_ROUND);
  });

  it("done after final round", () => {
    let s = { ...initialState(1, settings3), round: 3, dice: [1, 1, 1, 1, 1], roundScore: 5 };
    s = reducer(s, { type: "endRound" });
    expect(s.done).toBe(true);
  });

  it("no-op if no dice rolled yet", () => {
    const s = initialState(1, settings3);
    const s2 = reducer(s, { type: "endRound" });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, settings3))).toBeNull();
  });

  it("returns totalScore when done", () => {
    const s = { ...initialState(1, settings3), done: true, totalScore: 42 };
    expect(isTerminal(s)!.score).toBe(42);
  });
});
