import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TripleDiceSettings } from "./state.js";

const settings: TripleDiceSettings = { rounds: "5" };

describe("TripleDice initialState", () => {
  it("starts at round 1 with 2 rolls left", () => {
    const s = initialState(1, settings);
    expect(s.round).toBe(1);
    expect(s.rollsLeft).toBe(2);
    expect(s.totalScore).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("dice are in range 1-6", () => {
    const s = initialState(42, settings);
    for (const d of s.dice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });
});

describe("TripleDice reducer", () => {
  it("roll reduces rollsLeft", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsLeft).toBe(1);
  });

  it("roll at 0 rolls left does nothing", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" }); // now roundOver
    const s3 = reducer(s, { type: "roll" });
    expect(s3.rollsLeft).toBe(0);
  });

  it("toggleKeep flips keep state", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "toggleKeep", index: 1 });
    expect(s2.kept[1]).toBe(true);
    const s3 = reducer(s2, { type: "toggleKeep", index: 1 });
    expect(s3.kept[1]).toBe(false);
  });

  it("score advances to next round", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" }); // round over
    const s2 = reducer(s, { type: "score" });
    expect(s2.round).toBe(2);
    expect(s2.rollsLeft).toBe(2);
  });

  it("game ends after all rounds scored", () => {
    let s = initialState(1, { rounds: "5" });
    for (let r = 0; r < 5; r++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score" });
    }
    expect(s.gameOver).toBe(true);
  });

  it("restart resets state", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "restart" });
    expect(s.round).toBe(1);
    expect(s.totalScore).toBe(0);
  });
});

describe("TripleDice isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when game over", () => {
    let s = initialState(1, { rounds: "5" });
    for (let r = 0; r < 5; r++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score" });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });
});
