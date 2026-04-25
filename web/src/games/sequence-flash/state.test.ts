import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SequenceFlashState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("SequenceFlash initialState", () => {
  it("starts idle with empty sequence", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.sequence.length).toBe(0);
    expect(s.round).toBe(0);
    expect(s.gridSize).toBe(3);
  });

  it("is deterministic", () => {
    const s1 = initialState(77, noSettings);
    const s2 = initialState(77, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("SequenceFlash start", () => {
  it("adds one cell and enters flashing", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("flashing");
    expect(s2.sequence.length).toBe(1);
    expect(s2.round).toBe(1);
    expect(s2.activeCell).toBeGreaterThanOrEqual(0);
    expect(s2.activeCell).toBeLessThan(9);
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
      for (let i = 0; i < 4; i++) {
        s = reducer(s, { type: "start" });
        s = { ...s, phase: "complete" };
      }
      return [...s.sequence];
    };
    expect(play(100)).toEqual(play(100));
  });
});

describe("SequenceFlash advance-flash", () => {
  it("single sequence transitions to input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "advance-flash" });
    expect(s3.phase).toBe("input");
  });

  it("two-item sequence cycles through both", () => {
    const s = initialState(42, noSettings);
    let cur = reducer(s, { type: "start" });
    cur = { ...cur, phase: "complete" };
    cur = reducer(cur, { type: "start" });
    cur = reducer(cur, { type: "advance-flash" });
    expect(cur.phase).toBe("flashing");
    cur = reducer(cur, { type: "advance-flash" });
    expect(cur.phase).toBe("input");
  });
});

describe("SequenceFlash tap-cell", () => {
  const getInput = (): SequenceFlashState => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    return { ...s2, phase: "input", playerInput: [] };
  };

  it("correct tap completes round", () => {
    const s = getInput();
    const s2 = reducer(s, { type: "tap-cell", cell: s.sequence[0]! });
    expect(s2.phase).toBe("complete");
  });

  it("wrong tap fails", () => {
    const s = getInput();
    const wrong = s.sequence[0] === 0 ? 1 : 0;
    const s2 = reducer(s, { type: "tap-cell", cell: wrong });
    expect(s2.phase).toBe("failed");
  });

  it("tap ignored when not in input phase", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "tap-cell", cell: 0 });
    expect(s2.phase).toBe("idle");
  });
});

describe("SequenceFlash isTerminal", () => {
  it("null when not failed", () => {
    const s = initialState(42, noSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("score is round - 1 on failure", () => {
    const s: SequenceFlashState = { ...initialState(42, noSettings), phase: "failed", round: 5 };
    expect(isTerminal(s)!.score).toBe(4);
  });
});
