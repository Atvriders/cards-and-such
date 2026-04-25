import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { RepeatAfterMeState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("RepeatAfterMe initialState", () => {
  it("starts idle with empty sequence", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.sequence.length).toBe(0);
    expect(s.round).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(11, noSettings);
    const s2 = initialState(11, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("RepeatAfterMe start", () => {
  it("adds one action and enters showing", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.sequence.length).toBe(1);
    expect(s2.round).toBe(1);
  });

  it("grows sequence each round", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer({ ...s2, phase: "complete" }, { type: "start" });
    expect(s3.sequence.length).toBe(2);
  });

  it("same seed same sequence", () => {
    const play = (seed: number) => {
      let s = initialState(seed, noSettings);
      for (let i = 0; i < 5; i++) {
        s = reducer(s, { type: "start" });
        s = { ...s, phase: "complete" };
      }
      return [...s.sequence];
    };
    expect(play(22)).toEqual(play(22));
  });
});

describe("RepeatAfterMe advance-flash", () => {
  it("single action transitions to input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "advance-flash" });
    expect(s3.phase).toBe("input");
  });

  it("two actions cycles both then enters input", () => {
    const s = initialState(42, noSettings);
    let cur = reducer(s, { type: "start" });
    cur = { ...cur, phase: "complete" };
    cur = reducer(cur, { type: "start" });
    cur = reducer(cur, { type: "advance-flash" });
    expect(cur.phase).toBe("showing");
    cur = reducer(cur, { type: "advance-flash" });
    expect(cur.phase).toBe("input");
  });
});

describe("RepeatAfterMe perform", () => {
  const getInput = (): RepeatAfterMeState => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    return { ...s2, phase: "input", playerIndex: 0 };
  };

  it("correct action completes single-step round", () => {
    const s = getInput();
    const s2 = reducer(s, { type: "perform", action: s.sequence[0]! });
    expect(s2.phase).toBe("complete");
  });

  it("wrong action fails", () => {
    const s = getInput();
    const expected = s.sequence[0]!;
    const wrong = (["clap", "stomp", "snap", "tap"] as const).find(a => a !== expected)!;
    const s2 = reducer(s, { type: "perform", action: wrong });
    expect(s2.phase).toBe("failed");
  });

  it("perform ignored when not in input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "perform", action: "clap" });
    expect(s2.phase).toBe("idle");
  });
});

describe("RepeatAfterMe isTerminal", () => {
  it("null when not failed", () => {
    expect(isTerminal(initialState(42, noSettings))).toBeNull();
  });

  it("score is round - 1 on failure", () => {
    const s: RepeatAfterMeState = { ...initialState(42, noSettings), phase: "failed", round: 5 };
    expect(isTerminal(s)!.score).toBe(4);
  });

  it("score floor is 0", () => {
    const s: RepeatAfterMeState = { ...initialState(42, noSettings), phase: "failed", round: 0 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
