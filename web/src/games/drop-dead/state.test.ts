import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { dice: "5" as const };

describe("DropDead initialState", () => {
  it("starts with score=0, activeDice=5, phase=rolling", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.activeDice).toBe(5);
    expect(s.phase).toBe("rolling");
    expect(s.lastRoll).toHaveLength(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1).toEqual(s2);
  });
});

describe("DropDead roll", () => {
  it("produces lastRoll of correct length", () => {
    const s = initialState(10, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.lastRoll).toHaveLength(5);
  });

  it("all dice values between 1 and 6", () => {
    const s = initialState(7, settings);
    const s2 = reducer(s, { type: "roll" });
    for (const v of s2.lastRoll) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it("dead dice (2 or 5) reduce activeDice and score nothing", () => {
    // Find a seed where dead dice appear
    for (let seed = 0; seed < 100; seed++) {
      const s = initialState(seed, settings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.deadIndices.length > 0) {
        expect(s2.score).toBe(0); // dead dice = no score
        expect(s2.activeDice).toBe(5 - s2.deadIndices.length);
        return;
      }
    }
    throw new Error("No seed with dead dice found");
  });

  it("no dead dice: score increases by sum of roll", () => {
    for (let seed = 0; seed < 100; seed++) {
      const s = initialState(seed, settings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.deadIndices.length === 0) {
        const expected = s2.lastRoll.reduce((a, b) => a + b, 0);
        expect(s2.score).toBe(expected);
        expect(s2.activeDice).toBe(5);
        return;
      }
    }
    throw new Error("No seed without dead dice found");
  });

  it("game ends when activeDice reaches 0", () => {
    const s = initialState(1, { dice: "5" as const });
    // Simulate until done
    let st = s;
    for (let i = 0; i < 100; i++) {
      if (st.phase === "done") break;
      st = reducer(st, { type: "roll" });
    }
    expect(st.phase).toBe("done");
    expect(st.activeDice).toBe(0);
  });
});

describe("DropDead isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(1, settings);
    let st = s;
    for (let i = 0; i < 200; i++) {
      if (st.phase === "done") break;
      st = reducer(st, { type: "roll" });
    }
    const result = isTerminal(st);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(st.score);
  });
});
