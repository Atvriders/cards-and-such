import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MelodyRepeaterState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("MelodyRepeater initialState", () => {
  it("starts idle with empty melody", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.melody.length).toBe(0);
    expect(s.round).toBe(0);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(10, noSettings);
    const s2 = initialState(10, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("MelodyRepeater start", () => {
  it("start adds one note and enters playing", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("playing");
    expect(s2.melody.length).toBe(1);
    expect(s2.round).toBe(1);
  });

  it("start after complete grows melody", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer({ ...s2, phase: "complete" }, { type: "start" });
    expect(s3.melody.length).toBe(2);
  });

  it("same seed yields same melody", () => {
    const play = (seed: number) => {
      let s = initialState(seed, noSettings);
      for (let i = 0; i < 5; i++) {
        s = reducer(s, { type: "start" });
        s = { ...s, phase: "complete" };
      }
      return [...s.melody];
    };
    expect(play(55)).toEqual(play(55));
  });
});

describe("MelodyRepeater advance-note", () => {
  it("single note sequence transitions to input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "advance-note" });
    expect(s3.phase).toBe("input");
  });

  it("two note sequence flashes both before input", () => {
    const s = initialState(42, noSettings);
    let cur = reducer(s, { type: "start" });
    cur = { ...cur, phase: "complete" };
    cur = reducer(cur, { type: "start" });
    cur = reducer(cur, { type: "advance-note" });
    expect(cur.phase).toBe("playing");
    cur = reducer(cur, { type: "advance-note" });
    expect(cur.phase).toBe("input");
  });
});

describe("MelodyRepeater play", () => {
  it("correct note on single-item melody completes round", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const inputState: MelodyRepeaterState = { ...s2, phase: "input", playerIndex: 0 };
    const expected = s2.melody[0]!;
    const s3 = reducer(inputState, { type: "play", note: expected });
    expect(s3.phase).toBe("complete");
  });

  it("wrong note fails", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const inputState: MelodyRepeaterState = { ...s2, phase: "input", playerIndex: 0 };
    const expected = s2.melody[0]!;
    const wrong = (["C", "D", "E", "F", "G", "A"] as const).find(n => n !== expected)!;
    const s3 = reducer(inputState, { type: "play", note: wrong });
    expect(s3.phase).toBe("failed");
  });

  it("play ignored when not in input phase", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "play", note: "C" });
    expect(s2.phase).toBe("idle");
  });
});

describe("MelodyRepeater isTerminal", () => {
  it("returns null when not failed", () => {
    const s = initialState(42, noSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("score is round - 1 on failure", () => {
    const s: MelodyRepeaterState = { ...initialState(42, noSettings), phase: "failed", round: 3 };
    expect(isTerminal(s)!.score).toBe(2);
  });

  it("score is 0 when round is 0", () => {
    const s: MelodyRepeaterState = { ...initialState(42, noSettings), phase: "failed", round: 0 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
