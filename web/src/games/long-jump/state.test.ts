import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s3 = { attempts: "3" as const };

describe("initialState", () => {
  it("starts at 0 attempts", () => {
    const s = initialState(1, s3);
    expect(s.attemptIndex).toBe(0);
    expect(s.bestDistance).toBe(0);
  });

  it("starts in run phase", () => {
    expect(initialState(1, s3).phase).toBe("run");
  });

  it("is deterministic", () => {
    const a = initialState(42, s3);
    const b = initialState(42, s3);
    expect(a.rngSeed).toBe(b.rngSeed);
  });
});

describe("reducer", () => {
  it("jump records attempt", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "jump" });
    expect(s2.attempts.length).toBe(1);
    expect(s2.attemptIndex).toBe(1);
  });

  it("timing > 0.95 causes foul", () => {
    const s = { ...initialState(1, s3), timing: 0.99 };
    const s2 = reducer(s, { type: "jump" });
    expect(s2.attempts[0]!.foul).toBe(true);
    expect(s2.lastResult).toContain("FOUL");
  });

  it("completes after totalAttempts", () => {
    let s = initialState(7, s3);
    let iters = 0;
    while (s.phase !== "done" && iters < 30) {
      if (s.phase === "run") s = reducer(s, { type: "jump" });
      else s = reducer(s, { type: "next" });
      iters++;
    }
    expect(s.phase).toBe("done");
    expect(s.attemptIndex).toBe(3);
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s3), phase: "done" as const };
    expect(reducer(done, { type: "jump" })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s3))).toBeNull();
  });

  it("world-class score near 1000", () => {
    const done = { ...initialState(1, s3), phase: "done" as const, bestDistance: 8.5 };
    expect(isTerminal(done)!.score).toBe(1000);
  });

  it("shorter jump scores less", () => {
    const done = { ...initialState(1, s3), phase: "done" as const, bestDistance: 4.25 };
    expect(isTerminal(done)!.score).toBe(500);
  });

  it("capped at 1000", () => {
    const done = { ...initialState(1, s3), phase: "done" as const, bestDistance: 10 };
    expect(isTerminal(done)!.score).toBe(1000);
  });
});
