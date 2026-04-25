import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s3 = { throws: "3" as const };

describe("initialState", () => {
  it("starts at 0 throws", () => {
    const s = initialState(1, s3);
    expect(s.throwIndex).toBe(0);
    expect(s.bestDistance).toBe(0);
  });

  it("starts in aim phase", () => {
    expect(initialState(1, s3).phase).toBe("aim");
  });

  it("is deterministic", () => {
    const a = initialState(99, s3);
    const b = initialState(99, s3);
    expect(a.wind).toBeCloseTo(b.wind);
  });
});

describe("reducer", () => {
  it("throw records attempt", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "throw" });
    expect(s2.throws.length).toBe(1);
    expect(s2.throwIndex).toBe(1);
  });

  it("release > 0.92 causes foul", () => {
    const s = { ...initialState(1, s3), release: 0.95 };
    const s2 = reducer(s, { type: "throw" });
    expect(s2.throws[0]!.foul).toBe(true);
    expect(s2.lastResult).toContain("FOUL");
  });

  it("completes after totalThrows", () => {
    let s = initialState(4, s3);
    let iters = 0;
    while (s.phase !== "done" && iters < 30) {
      if (s.phase === "aim") s = reducer(s, { type: "throw" });
      else s = reducer(s, { type: "next" });
      iters++;
    }
    expect(s.phase).toBe("done");
    expect(s.throwIndex).toBe(3);
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s3), phase: "done" as const };
    expect(reducer(done, { type: "throw" })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s3))).toBeNull();
  });

  it("65m scores 1000", () => {
    const done = { ...initialState(1, s3), phase: "done" as const, bestDistance: 65 };
    expect(isTerminal(done)!.score).toBe(1000);
  });

  it("shorter scores less", () => {
    const done = { ...initialState(1, s3), phase: "done" as const, bestDistance: 32.5 };
    expect(isTerminal(done)!.score).toBe(500);
  });

  it("capped at 1000", () => {
    const done = { ...initialState(1, s3), phase: "done" as const, bestDistance: 100 };
    expect(isTerminal(done)!.score).toBe(1000);
  });
});
