import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DrumPadState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("DrumPad initialState", () => {
  it("starts idle with empty pattern", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.pattern.length).toBe(0);
    expect(s.round).toBe(0);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(5, noSettings);
    const s2 = initialState(5, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("DrumPad start", () => {
  it("adds one drum and enters showing", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.pattern.length).toBe(1);
    expect(s2.round).toBe(1);
  });

  it("grows pattern each round", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer({ ...s2, phase: "complete" }, { type: "start" });
    expect(s3.pattern.length).toBe(2);
  });

  it("same seed produces same pattern", () => {
    const play = (seed: number) => {
      let s = initialState(seed, noSettings);
      for (let i = 0; i < 5; i++) {
        s = reducer(s, { type: "start" });
        s = { ...s, phase: "complete" };
      }
      return [...s.pattern];
    };
    expect(play(33)).toEqual(play(33));
  });
});

describe("DrumPad advance-flash", () => {
  it("single drum transitions to input after flash", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "advance-flash" });
    expect(s3.phase).toBe("input");
  });

  it("two-drum pattern flashes both then enters input", () => {
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

describe("DrumPad hit", () => {
  const getInput = (): DrumPadState => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    return { ...s2, phase: "input", playerInput: [] };
  };

  it("correct hit completes round", () => {
    const s = getInput();
    const s2 = reducer(s, { type: "hit", sound: s.pattern[0]! });
    expect(s2.phase).toBe("complete");
  });

  it("wrong hit fails", () => {
    const s = getInput();
    const expected = s.pattern[0]!;
    const wrong = (["kick", "snare", "hihat", "tom"] as const).find(d => d !== expected)!;
    const s2 = reducer(s, { type: "hit", sound: wrong });
    expect(s2.phase).toBe("failed");
  });

  it("hit ignored when not in input phase", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "hit", sound: "kick" });
    expect(s2.phase).toBe("idle");
  });
});

describe("DrumPad isTerminal", () => {
  it("null when not failed", () => {
    expect(isTerminal(initialState(42, noSettings))).toBeNull();
  });

  it("score is round - 1 on failure", () => {
    const s: DrumPadState = { ...initialState(42, noSettings), phase: "failed", round: 6 };
    expect(isTerminal(s)!.score).toBe(5);
  });
});
