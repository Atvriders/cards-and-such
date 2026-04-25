import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s5 = { outs: "5" as const };

describe("initialState", () => {
  it("starts with 0 home runs and 0 outs", () => {
    const s = initialState(1, s5);
    expect(s.homeRuns).toBe(0);
    expect(s.outsUsed).toBe(0);
  });

  it("starts in aim phase", () => {
    const s = initialState(1, s5);
    expect(s.phase).toBe("aim");
  });

  it("is deterministic", () => {
    const a = initialState(42, s5);
    const b = initialState(42, s5);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.wind).toBeCloseTo(b.wind);
  });
});

describe("reducer", () => {
  it("swing records a result", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "swing" });
    expect(s2.swings.length).toBe(1);
  });

  it("timing clamped to 0..1", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "set-timing", value: 2 });
    expect(s2.timing).toBe(1);
    const s3 = reducer(s, { type: "set-timing", value: -1 });
    expect(s3.timing).toBe(0);
  });

  it("completes after maxOuts outs", () => {
    let s = initialState(999, s5);
    // Force 5 outs by setting worst timing
    let iters = 0;
    while (s.phase !== "done" && iters < 100) {
      if (s.phase === "aim") {
        s = reducer(s, { type: "set-timing", value: 0 });
        s = reducer(s, { type: "set-power", value: 0 });
        s = reducer(s, { type: "swing" });
      } else {
        s = reducer(s, { type: "next" });
      }
      iters++;
    }
    expect(s.phase).toBe("done");
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s5), phase: "done" as const };
    expect(reducer(done, { type: "swing" })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("score = homeRuns * 100", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, homeRuns: 7 };
    expect(isTerminal(done)!.score).toBe(700);
  });

  it("zero HRs scores 0", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, homeRuns: 0 };
    expect(isTerminal(done)!.score).toBe(0);
  });
});
