import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreCategory } from "./state.js";
import type { CragState } from "./state.js";

const defaultSettings = {};

describe("Crag scoreCategory", () => {
  it("scores odd straight correctly", () => {
    expect(scoreCategory([1, 3, 5], "odd-straight")).toBe(20);
    expect(scoreCategory([1, 2, 5], "odd-straight")).toBe(0);
  });

  it("scores crag (pair + sum 13)", () => {
    expect(scoreCategory([4, 4, 5], "crag")).toBe(50);
    expect(scoreCategory([1, 6, 6], "crag")).toBe(50);
    expect(scoreCategory([3, 4, 6], "crag")).toBe(0); // no pair
  });

  it("scores thirteen (all different, sum 13)", () => {
    expect(scoreCategory([3, 4, 6], "thirteen")).toBe(26);
    expect(scoreCategory([2, 5, 6], "thirteen")).toBe(26);
    expect(scoreCategory([4, 4, 5], "thirteen")).toBe(0); // pair
  });

  it("scores chance as sum", () => {
    expect(scoreCategory([2, 3, 4], "chance")).toBe(9);
    expect(scoreCategory([6, 6, 6], "chance")).toBe(18);
  });
});

describe("Crag initialState", () => {
  it("starts at 0 total and preRoll", () => {
    const s = initialState(1, defaultSettings);
    expect(s.totalScore).toBe(0);
    expect(s.phase).toBe("preRoll");
    expect(s.rollsLeft).toBe(3);
    expect(s.turnsLeft).toBe(14);
  });
});

describe("Crag roll", () => {
  it("rolls dice and transitions to rolled", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("rolled");
    expect(s2.rollsLeft).toBe(2);
    expect(s2.dice).toHaveLength(3);
    s2.dice.forEach((d) => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    });
  });

  it("kept dice are not rerolled", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "toggleKeep", index: 0 });
    const kept = s2.dice[0];
    const s4 = reducer(s3, { type: "roll" });
    expect(s4.dice[0]).toBe(kept);
  });
});

describe("Crag score", () => {
  it("scores a category and resets for next turn", () => {
    const base = initialState(1, defaultSettings);
    const ready: CragState = {
      ...base,
      dice: [2, 2, 2],
      keptMask: [false, false, false],
      rollsLeft: 1,
      phase: "rolled",
    };
    const s2 = reducer(ready, { type: "score", category: "threes" });
    expect(s2.scores["threes"]).toBe(0); // no 3s
    expect(s2.turnsLeft).toBe(13);
    expect(s2.phase).toBe("preRoll");
  });

  it("gameDone after all categories scored", () => {
    const base = initialState(1, defaultSettings);
    const almostDone: CragState = {
      ...base,
      dice: [1, 1, 1],
      phase: "rolled",
      rollsLeft: 0,
      turnsLeft: 1,
      scores: {
        twos: 0, threes: 0, fours: 0, fives: 0, sixes: 0,
        "odd-straight": 0, "even-straight": 0, "low-straight": 0, "high-straight": 0,
        "three-of-a-kind": 25, crag: 0, thirteen: 0, "any-thirteen": 0,
      },
    };
    const s2 = reducer(almostDone, { type: "score", category: "chance" });
    expect(s2.phase).toBe("gameDone");
  });
});

describe("Crag isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when gameDone", () => {
    const base = initialState(1, defaultSettings);
    const done: CragState = { ...base, phase: "gameDone", totalScore: 150 };
    const result = isTerminal(done);
    expect(result?.score).toBe(150);
  });
});
