import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DanceArrowsState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("DanceArrows initialState", () => {
  it("starts in idle with empty sequence", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.sequence.length).toBe(0);
    expect(s.round).toBe(0);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99, noSettings);
    const s2 = initialState(99, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("DanceArrows start", () => {
  it("entering showing phase adds one arrow", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.sequence.length).toBe(1);
    expect(s2.round).toBe(1);
  });

  it("start after complete grows sequence", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer({ ...s2, phase: "complete" }, { type: "start" });
    expect(s3.sequence.length).toBe(2);
    expect(s3.round).toBe(2);
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
    expect(play(7)).toEqual(play(7));
  });
});

describe("DanceArrows advance-flash", () => {
  it("moves to input after single-item sequence", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "advance-flash" });
    expect(s3.phase).toBe("input");
  });

  it("cycles through all flashes before input", () => {
    const s = initialState(42, noSettings);
    let cur = reducer(s, { type: "start" });
    cur = { ...cur, phase: "complete" };
    cur = reducer(cur, { type: "start" }); // sequence length 2
    cur = reducer(cur, { type: "advance-flash" }); // flash index 1
    expect(cur.phase).toBe("showing");
    cur = reducer(cur, { type: "advance-flash" }); // done
    expect(cur.phase).toBe("input");
  });
});

describe("DanceArrows press", () => {
  it("correct press on single sequence completes round", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const inputState: DanceArrowsState = { ...s2, phase: "input", playerIndex: 0 };
    const expected = s2.sequence[0]!;
    const s3 = reducer(inputState, { type: "press", arrow: expected });
    expect(s3.phase).toBe("complete");
  });

  it("wrong press fails the game", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const inputState: DanceArrowsState = { ...s2, phase: "input", playerIndex: 0 };
    const expected = s2.sequence[0]!;
    const wrong = (["up", "down", "left", "right"] as const).find(a => a !== expected)!;
    const s3 = reducer(inputState, { type: "press", arrow: wrong });
    expect(s3.phase).toBe("failed");
  });

  it("press ignored when not in input phase", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "press", arrow: "up" });
    expect(s2.phase).toBe("idle");
  });
});

describe("DanceArrows isTerminal", () => {
  it("returns null when not failed", () => {
    const s = initialState(42, noSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("score is rounds - 1 on failure", () => {
    const s: DanceArrowsState = { ...initialState(42, noSettings), phase: "failed", round: 4 };
    expect(isTerminal(s)!.score).toBe(3);
  });

  it("score floor is 0", () => {
    const s: DanceArrowsState = { ...initialState(42, noSettings), phase: "failed", round: 0 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
