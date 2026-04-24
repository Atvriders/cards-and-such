import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreSelection } from "./state.js";
import type { ZilchState, DieFace } from "./state.js";

const settings = { target: "10000" as const };

describe("Zilch scoreSelection", () => {
  it("single 1 = 100", () => {
    expect(scoreSelection([1])).toBe(100);
  });

  it("single 5 = 50", () => {
    expect(scoreSelection([5])).toBe(50);
  });

  it("three 2s = 200", () => {
    expect(scoreSelection([2, 2, 2])).toBe(200);
  });

  it("three 1s = 1000", () => {
    expect(scoreSelection([1, 1, 1])).toBe(1000);
  });

  it("non-scoring dice return 0", () => {
    expect(scoreSelection([2])).toBe(0);
    expect(scoreSelection([3, 4])).toBe(0);
  });
});

describe("Zilch initialState", () => {
  it("starts with score=0, diceLeft=6, phase=preRoll", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.diceLeft).toBe(6);
    expect(s.phase).toBe("preRoll");
  });

  it("deterministic", () => {
    expect(initialState(55, settings)).toEqual(initialState(55, settings));
  });
});

describe("Zilch roll", () => {
  it("roll produces 6 dice values between 1-6", () => {
    const s = initialState(7, settings);
    const s2 = reducer(s, { type: "roll" });
    if (s2.phase === "rolled" || s2.phase === "zilched") {
      expect(s2.currentRoll).toHaveLength(6);
      for (const v of s2.currentRoll) {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(6);
      }
    }
  });

  it("zilch: turn score resets to 0", () => {
    // Find a zilch seed
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, settings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.phase === "zilched") {
        expect(s2.turnScore).toBe(0);
        return;
      }
    }
    throw new Error("No zilch found");
  });

  it("valid roll allows toggle and bank", () => {
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, settings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.phase === "rolled") {
        // Find a scoring die
        const scoringIdx = s2.currentRoll.findIndex((v) => v === 1 || v === 5);
        if (scoringIdx >= 0) {
          const s3 = reducer(s2, { type: "toggleHold", index: scoringIdx });
          expect(s3.heldIndices).toContain(scoringIdx);
          const s4 = reducer(s3, { type: "bank" });
          expect(s4.score).toBeGreaterThan(0);
          return;
        }
      }
    }
    throw new Error("No scoring roll found");
  });
});

describe("Zilch isTerminal", () => {
  it("null when not won", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, settings);
    const won: ZilchState = { ...s, phase: "won", score: 10000 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(10000);
  });
});
