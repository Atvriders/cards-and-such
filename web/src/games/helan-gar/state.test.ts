import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, stageName, stageTarget } from "./state.js";
import type { HelanGarState } from "./state.js";

const settings = { stages: "6" as const };

describe("HelanGar helpers", () => {
  it("stage names are correct", () => {
    expect(stageName(1)).toBe("Helan");
    expect(stageName(6)).toBe("Sexan");
  });

  it("stage targets are correct", () => {
    expect(stageTarget(1)).toBe(3);
    expect(stageTarget(6)).toBe(8);
  });
});

describe("HelanGar initialState", () => {
  it("starts at stage 1, 3 rolls, preRoll phase", () => {
    const s = initialState(42, settings);
    expect(s.stage).toBe(1);
    expect(s.rollsLeft).toBe(3);
    expect(s.phase).toBe("preRoll");
    expect(s.score).toBe(0);
  });

  it("is deterministic", () => {
    expect(initialState(10, settings)).toEqual(initialState(10, settings));
  });
});

describe("HelanGar roll", () => {
  it("roll produces 2 dice between 1-6", () => {
    const s = initialState(5, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.currentRoll).not.toBeNull();
    expect(s2.currentRoll![0]).toBeGreaterThanOrEqual(1);
    expect(s2.currentRoll![1]).toBeGreaterThanOrEqual(1);
    expect(s2.currentRoll![0]).toBeLessThanOrEqual(6);
  });

  it("hit scores stage points and moves to stageOver", () => {
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, settings);
      let st = s;
      for (let r = 0; r < 3; r++) {
        if (st.phase === "stageOver") break;
        st = reducer(st, { type: "roll" });
      }
      if (st.hitThisStage) {
        expect(st.score).toBe(st.stage); // stage 1 = 1 point
        return;
      }
    }
    throw new Error("No hit found in 200 seeds");
  });

  it("miss deducts 1 point", () => {
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, settings);
      let st = s;
      for (let r = 0; r < 3; r++) {
        if (st.phase === "stageOver") break;
        st = reducer(st, { type: "roll" });
      }
      if (!st.hitThisStage && st.phase === "stageOver") {
        expect(st.score).toBe(-1);
        return;
      }
    }
    throw new Error("No miss found in 200 seeds");
  });
});

describe("HelanGar nextStage", () => {
  it("advances stage and resets rolls", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" }); // roll
    // Cheat to stageOver
    const stageOver: HelanGarState = { ...s, phase: "stageOver" };
    const s2 = reducer(stageOver, { type: "nextStage" });
    expect(s2.stage).toBe(2);
    expect(s2.rollsLeft).toBe(3);
  });

  it("done after last stage", () => {
    let s = initialState(1, { stages: "3" as const });
    for (let i = 0; i < 3; i++) {
      for (let r = 0; r < 3; r++) {
        if (s.phase === "stageOver") break;
        s = reducer(s, { type: "roll" });
      }
      s = reducer(s, { type: "nextStage" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("HelanGar isTerminal", () => {
  it("null when not done", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(1, settings);
    const done: HelanGarState = { ...s, phase: "done", score: 5 };
    const result = isTerminal(done);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(15); // 5 + 10 offset
  });
});
