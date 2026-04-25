import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { RhythmLadderState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("RhythmLadder initialState", () => {
  it("starts idle with empty rungs", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.rungs.length).toBe(0);
    expect(s.round).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(13, noSettings);
    const s2 = initialState(13, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("RhythmLadder start", () => {
  it("adds one rung and enters descending", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("descending");
    expect(s2.rungs.length).toBe(1);
    expect(s2.round).toBe(1);
    expect(s2.activeRung).toBe(0);
  });

  it("grows rungs each round", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer({ ...s2, phase: "complete" }, { type: "start" });
    expect(s3.rungs.length).toBe(2);
  });

  it("same seed same sequence", () => {
    const play = (seed: number) => {
      let s = initialState(seed, noSettings);
      for (let i = 0; i < 5; i++) {
        s = reducer(s, { type: "start" });
        s = { ...s, phase: "complete" };
      }
      return [...s.rungs];
    };
    expect(play(88)).toEqual(play(88));
  });
});

describe("RhythmLadder advance-rung", () => {
  it("single rung transitions to input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "advance-rung" });
    expect(s3.phase).toBe("input");
  });

  it("two rungs descend both then enter input", () => {
    const s = initialState(42, noSettings);
    let cur = reducer(s, { type: "start" });
    cur = { ...cur, phase: "complete" };
    cur = reducer(cur, { type: "start" });
    cur = reducer(cur, { type: "advance-rung" });
    expect(cur.phase).toBe("descending");
    expect(cur.activeRung).toBe(1);
    cur = reducer(cur, { type: "advance-rung" });
    expect(cur.phase).toBe("input");
  });
});

describe("RhythmLadder step", () => {
  const getInput = (): RhythmLadderState => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    return { ...s2, phase: "input", playerInput: [] };
  };

  it("correct step completes single-rung round", () => {
    const s = getInput();
    const s2 = reducer(s, { type: "step", color: s.rungs[0]! });
    expect(s2.phase).toBe("complete");
  });

  it("wrong step fails", () => {
    const s = getInput();
    const expected = s.rungs[0]!;
    const wrong = (["red", "blue", "green", "yellow", "purple"] as const).find(c => c !== expected)!;
    const s2 = reducer(s, { type: "step", color: wrong });
    expect(s2.phase).toBe("failed");
  });

  it("step ignored when not in input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "step", color: "red" });
    expect(s2.phase).toBe("idle");
  });
});

describe("RhythmLadder isTerminal", () => {
  it("null when not failed", () => {
    expect(isTerminal(initialState(42, noSettings))).toBeNull();
  });

  it("score is round - 1 on failure", () => {
    const s: RhythmLadderState = { ...initialState(42, noSettings), phase: "failed", round: 7 };
    expect(isTerminal(s)!.score).toBe(6);
  });

  it("score floor is 0", () => {
    const s: RhythmLadderState = { ...initialState(42, noSettings), phase: "failed", round: 0 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
