import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  isValidStack,
  stackScore,
  isPerfect,
  ROUNDS,
  PERFECT_BONUS,
} from "./state.js";

const settings = { diceSides: 6 as const };

describe("DiceTowerStack initialState", () => {
  it("starts in stacking phase, round 1, dice rolled", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("stacking");
    expect(s.round).toBe(1);
    expect(s.dice).toHaveLength(5);
    expect(s.selected).toEqual([]);
    expect(s.committed).toBe(false);
    expect(s.totalScore).toBe(0);
  });

  it("same seed produces same dice", () => {
    const a = initialState(7, settings);
    const b = initialState(7, settings);
    expect(a.dice).toEqual(b.dice);
  });

  it("dice values are within 1..sides", () => {
    const s = initialState(99, settings);
    for (const v of s.dice) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });
});

describe("DiceTowerStack stack validation", () => {
  it("isValidStack accepts strictly ascending values in roll order", () => {
    expect(isValidStack([1, 3, 4, 2, 6], [0, 1, 2, 4])).toBe(true);
    expect(isValidStack([1, 3, 4, 2, 6], [])).toBe(true);
  });

  it("isValidStack rejects equal or decreasing values", () => {
    expect(isValidStack([3, 3, 4], [0, 1])).toBe(false);
    expect(isValidStack([5, 4], [0, 1])).toBe(false);
  });

  it("stackScore sums selected dice", () => {
    expect(stackScore([2, 4, 6, 1, 5], [0, 1, 2])).toBe(12);
    expect(stackScore([2, 4, 6, 1, 5], [])).toBe(0);
  });

  it("isPerfect requires all 5 dice ascending in roll order", () => {
    expect(isPerfect([1, 2, 3, 4, 5], [0, 1, 2, 3, 4])).toBe(true);
    expect(isPerfect([1, 2, 3, 4, 5], [0, 1, 2, 3])).toBe(false);
    expect(isPerfect([5, 4, 3, 2, 1], [0, 1, 2, 3, 4])).toBe(false);
  });
});

describe("DiceTowerStack reducer", () => {
  it("select adds an index when ascending; rejects when not", () => {
    let s = initialState(42, settings);
    s = { ...s, dice: [3, 5, 2, 6, 4] };
    s = reducer(s, { type: "select", idx: 0 }); // 3
    s = reducer(s, { type: "select", idx: 1 }); // 5 ok
    expect(s.selected).toEqual([0, 1]);
    s = reducer(s, { type: "select", idx: 2 }); // 2 < 5, reject
    expect(s.selected).toEqual([0, 1]);
    s = reducer(s, { type: "select", idx: 3 }); // 6 ok
    expect(s.selected).toEqual([0, 1, 3]);
  });

  it("select toggles off and clears the tail", () => {
    let s = initialState(42, settings);
    s = { ...s, dice: [1, 2, 3, 4, 5], selected: [0, 1, 2, 3] };
    s = reducer(s, { type: "select", idx: 1 });
    expect(s.selected).toEqual([0]);
  });

  it("commit adds score and perfect bonus when applicable", () => {
    let s = initialState(42, settings);
    s = { ...s, dice: [1, 2, 3, 4, 5], selected: [0, 1, 2, 3, 4] };
    s = reducer(s, { type: "commit" });
    expect(s.committed).toBe(true);
    expect(s.totalScore).toBe(1 + 2 + 3 + 4 + 5 + PERFECT_BONUS);
    expect(s.perfectCount).toBe(1);
  });

  it("commit without perfect gives only stack score", () => {
    let s = initialState(42, settings);
    s = { ...s, dice: [1, 2, 3, 4, 5], selected: [0, 2] };
    s = reducer(s, { type: "commit" });
    expect(s.totalScore).toBe(4);
    expect(s.perfectCount).toBe(0);
  });

  it("clear empties selection", () => {
    let s = initialState(42, settings);
    s = { ...s, dice: [1, 2, 3, 4, 5], selected: [0, 1, 2] };
    s = reducer(s, { type: "clear" });
    expect(s.selected).toEqual([]);
  });

  it("next advances rounds and finishes after 10", () => {
    let s = initialState(42, settings);
    for (let r = 0; r < ROUNDS; r++) {
      s = { ...s, selected: [] };
      s = reducer(s, { type: "commit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).toEqual({ score: s.totalScore });
  });
});
