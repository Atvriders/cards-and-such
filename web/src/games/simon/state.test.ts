import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SimonState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("Simon initialState", () => {
  it("starts in idle phase with empty sequence", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.sequence.length).toBe(0);
    expect(s.round).toBe(0);
    expect(s.playerIndex).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(77, noSettings);
    const s2 = initialState(77, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("Simon start", () => {
  it("start from idle enters showing phase with sequence length 1", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.sequence.length).toBe(1);
    expect(s2.round).toBe(1);
    expect(s2.flashIndex).toBe(0);
  });

  it("start after complete appends to sequence", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const complete: SimonState = { ...s2, phase: "complete" };
    const s3 = reducer(complete, { type: "start" });
    expect(s3.sequence.length).toBe(2);
    expect(s3.round).toBe(2);
  });

  it("same seed produces same sequence", () => {
    const play = (seed: number) => {
      let s = initialState(seed, noSettings);
      for (let i = 0; i < 5; i++) {
        s = reducer(s, { type: "start" });
        s = { ...s, phase: "complete" }; // pretend success
      }
      return [...s.sequence];
    };
    expect(play(10)).toEqual(play(10));
    // Different seeds likely differ
    const a = play(1);
    const b = play(2);
    expect(a.length).toBe(5);
    expect(b.length).toBe(5);
  });
});

describe("Simon advance-flash", () => {
  it("advance-flash moves to next color", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.flashIndex).toBe(0);
    const s3 = reducer(s2, { type: "advance-flash" });
    // If sequence length = 1, should move to input phase
    expect(s3.phase).toBe("input");
  });

  it("advance-flash cycles through all colors then enters input", () => {
    const s = initialState(42, noSettings);
    let cur = reducer(s, { type: "start" });
    cur = { ...cur, phase: "complete" };
    cur = reducer(cur, { type: "start" }); // now sequence length = 2
    // Flash index starts at 0
    expect(cur.flashIndex).toBe(0);
    cur = reducer(cur, { type: "advance-flash" }); // index 1
    expect(cur.phase).toBe("showing");
    expect(cur.flashIndex).toBe(1);
    cur = reducer(cur, { type: "advance-flash" }); // done
    expect(cur.phase).toBe("input");
  });
});

describe("Simon click input", () => {
  it("correct click advances playerIndex", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const inputState: SimonState = { ...s2, phase: "input", playerIndex: 0 };
    const expected = s2.sequence[0]!;
    const s3 = reducer(inputState, { type: "click", color: expected });
    // With sequence length 1, clicking the right color completes the round
    expect(s3.phase).toBe("complete");
  });

  it("wrong click sets phase to failed", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const inputState: SimonState = { ...s2, phase: "input", playerIndex: 0 };
    const expected = s2.sequence[0]!;
    // Find a different color
    const wrong = (["red", "green", "blue", "yellow"] as const).find((c) => c !== expected)!;
    const s3 = reducer(inputState, { type: "click", color: wrong });
    expect(s3.phase).toBe("failed");
  });

  it("click is no-op when not in input phase", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "click", color: "red" });
    expect(s2.phase).toBe("idle");
  });
});

describe("Simon isTerminal", () => {
  it("returns null when not failed", () => {
    const s = initialState(42, noSettings);
    expect(isTerminal(s)).toBeNull();
    const s2 = reducer(s, { type: "start" });
    expect(isTerminal(s2)).toBeNull();
  });

  it("returns score = rounds - 1 when failed on round N", () => {
    const s: SimonState = {
      ...initialState(42, noSettings),
      phase: "failed",
      round: 5,
    };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(4);
  });

  it("score is 0 when failing on first round", () => {
    const s: SimonState = {
      ...initialState(42, noSettings),
      phase: "failed",
      round: 1,
    };
    const result = isTerminal(s);
    expect(result!.score).toBe(0);
  });

  it("score floor is 0", () => {
    const s: SimonState = {
      ...initialState(42, noSettings),
      phase: "failed",
      round: 0,
    };
    const result = isTerminal(s);
    expect(result!.score).toBe(0);
  });
});
