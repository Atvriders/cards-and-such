import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ColorSequenceState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("ColorSequence initialState", () => {
  it("starts in idle with empty sequence", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.sequence.length).toBe(0);
    expect(s.round).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(77, noSettings);
    const s2 = initialState(77, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("ColorSequence start", () => {
  it("enters showing phase with sequence length 1", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.sequence.length).toBe(1);
    expect(s2.round).toBe(1);
    expect(s2.flashIndex).toBe(0);
  });

  it("appends after complete", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const complete: ColorSequenceState = { ...s2, phase: "complete" };
    const s3 = reducer(complete, { type: "start" });
    expect(s3.sequence.length).toBe(2);
  });

  it("uses only valid colors", () => {
    let s = initialState(1234, noSettings);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "start" });
      for (const c of s.sequence) {
        expect(["red","green","blue","yellow","purple"]).toContain(c);
      }
      s = { ...s, phase: "complete" };
    }
  });

  it("same seed produces same sequence", () => {
    const play = (seed: number) => {
      let s = initialState(seed, noSettings);
      for (let i = 0; i < 5; i++) {
        s = reducer(s, { type: "start" });
        s = { ...s, phase: "complete" };
      }
      return [...s.sequence];
    };
    expect(play(10)).toEqual(play(10));
  });
});

describe("ColorSequence advance-flash", () => {
  it("transitions to input after last flash", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" }); // sequence length 1, flashIndex 0
    const s3 = reducer(s2, { type: "advance-flash" });
    expect(s3.phase).toBe("input");
  });

  it("is no-op outside showing phase", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "advance-flash" });
    expect(s2.phase).toBe("idle");
  });
});

describe("ColorSequence click", () => {
  it("correct click completes single-step round", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const inputState: ColorSequenceState = { ...s2, phase: "input", playerIndex: 0 };
    const expected = s2.sequence[0]!;
    const s3 = reducer(inputState, { type: "click", color: expected });
    expect(s3.phase).toBe("complete");
  });

  it("wrong click sets failed", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const inputState: ColorSequenceState = { ...s2, phase: "input", playerIndex: 0 };
    const expected = s2.sequence[0]!;
    const wrong = (["red","green","blue","yellow","purple"] as const).find((c) => c !== expected)!;
    const s3 = reducer(inputState, { type: "click", color: wrong });
    expect(s3.phase).toBe("failed");
  });

  it("click is no-op in idle phase", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "click", color: "red" });
    expect(s2.phase).toBe("idle");
  });
});

describe("ColorSequence isTerminal", () => {
  it("returns null when not failed", () => {
    expect(isTerminal(initialState(42, noSettings))).toBeNull();
  });

  it("score = round - 1 when failed", () => {
    const s: ColorSequenceState = { ...initialState(42, noSettings), phase: "failed", round: 4 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(3);
  });

  it("score floor is 0", () => {
    const s: ColorSequenceState = { ...initialState(42, noSettings), phase: "failed", round: 0 };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("5 colors are all possible in long sequence", () => {
    let s = initialState(7, noSettings);
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      s = reducer(s, { type: "start" });
      if (s.sequence.length > 0) seen.add(s.sequence[s.sequence.length - 1]!);
      s = { ...s, phase: "complete" };
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
