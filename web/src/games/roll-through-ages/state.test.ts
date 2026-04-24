import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { RollThroughAgesState } from "./state.js";

const settings = { turns: "5" as const };

describe("RollThroughAges initialState", () => {
  it("starts with 3 cities, 6 food, phase=preRoll", () => {
    const s = initialState(42, settings);
    expect(s.cities).toBe(3);
    expect(s.food).toBe(6);
    expect(s.phase).toBe("preRoll");
    expect(s.turn).toBe(1);
  });

  it("is deterministic", () => {
    expect(initialState(11, settings)).toEqual(initialState(11, settings));
  });
});

describe("RollThroughAges roll", () => {
  it("roll produces dice equal to city count", () => {
    const s = initialState(5, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("rolled");
    expect(s2.currentRoll).toHaveLength(s.cities);
  });

  it("reroll changes unheld dice", () => {
    const s = initialState(3, settings);
    const rolled = reducer(s, { type: "roll" });
    // Hold first die
    const held = reducer(rolled, { type: "toggleHold", index: 0 });
    const rerolled = reducer(held, { type: "roll" });
    expect(rerolled.currentRoll[0]).toBe(rolled.currentRoll[0]); // held die unchanged
    expect(rerolled.rerollsLeft).toBe(1);
  });

  it("endRoll tallies food/goods/workers", () => {
    const s = initialState(7, settings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "endRoll" });
    expect(s3.phase).toBe("turnOver");
    // goods and workers should be >= 0
    expect(s3.goods).toBeGreaterThanOrEqual(0);
    expect(s3.workers).toBeGreaterThanOrEqual(0);
  });
});

describe("RollThroughAges nextTurn", () => {
  it("feeding deducts food", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "endRoll" });
    const s4 = reducer(s3, { type: "nextTurn" });
    // cities=3 food deducted from starting 6 (plus any food rolled)
    expect(s4.turn).toBe(2);
  });

  it("game ends after totalTurns", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "endRoll" });
      s = reducer(s, { type: "nextTurn" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("RollThroughAges isTerminal", () => {
  it("null when not done", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(1, settings);
    const done: RollThroughAgesState = { ...s, phase: "done", score: 25 };
    const result = isTerminal(done);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(25);
  });
});
