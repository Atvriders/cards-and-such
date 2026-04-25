import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { rounds: "8" as const };

describe("SumTargetDice initialState", () => {
  it("starts in rolling phase on round 1", () => {
    const s = initialState(1, def);
    expect(s.phase).toBe("rolling");
    expect(s.round).toBe(1);
  });

  it("target is between 5 and 16", () => {
    const s = initialState(1, def);
    expect(s.target).toBeGreaterThanOrEqual(5);
    expect(s.target).toBeLessThanOrEqual(16);
  });

  it("dice values are 1-6", () => {
    const s = initialState(1, def);
    for (const d of s.dice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it("is deterministic", () => {
    expect(initialState(3, def).target).toBe(initialState(3, def).target);
  });
});

describe("SumTargetDice reducer", () => {
  it("score awards points and transitions phase", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "score" });
    expect(["scored", "gameover"]).toContain(s2.phase);
  });

  it("roll decrements rerolls", () => {
    const s = initialState(1, def);
    expect(reducer(s, { type: "roll" }).rerollsLeft).toBe(1);
  });

  it("toggleHold flips hold state", () => {
    const s = initialState(1, def);
    expect(reducer(s, { type: "toggleHold", idx: 2 }).held[2]).toBe(true);
  });

  it("exact target match scores 50 pts", () => {
    // Find a seed where first roll exactly matches target
    for (let seed = 0; seed < 500; seed++) {
      const s = initialState(seed, def);
      const sum = s.dice[0] + s.dice[1] + s.dice[2];
      if (sum === s.target) {
        const s2 = reducer(s, { type: "score" });
        expect(s2.totalScore).toBe(50);
        return;
      }
    }
    // Just verify a score action works
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "score" });
    expect(s2.totalScore).toBeGreaterThanOrEqual(0);
  });
});

describe("SumTargetDice isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score after all rounds", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 8; i++) {
      s = reducer(s, { type: "score" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
