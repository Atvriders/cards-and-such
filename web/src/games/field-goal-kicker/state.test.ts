import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10 = { kicks: "10" as const };

describe("initialState", () => {
  it("starts with 0 kicks taken", () => {
    const s = initialState(1, s10);
    expect(s.kickIndex).toBe(0);
    expect(s.goodCount).toBe(0);
    expect(s.kicks.length).toBe(0);
  });

  it("starts in aim phase", () => {
    expect(initialState(1, s10).phase).toBe("aim");
  });

  it("is deterministic", () => {
    const a = initialState(33, s10);
    const b = initialState(33, s10);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.currentDistance).toBe(b.currentDistance);
  });
});

describe("reducer — kick", () => {
  it("kick increments kickIndex", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "kick" });
    expect(s2.kickIndex).toBe(1);
    expect(s2.kicks.length).toBe(1);
  });

  it("result is boolean good/miss", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "kick" });
    expect(typeof s2.kicks[0]!.good).toBe("boolean");
  });

  it("finishes after totalKicks", () => {
    let s = initialState(5, s10);
    let iters = 0;
    while (s.phase !== "done" && iters < 50) {
      if (s.phase === "aim") s = reducer(s, { type: "kick" });
      else s = reducer(s, { type: "next" });
      iters++;
    }
    expect(s.phase).toBe("done");
    expect(s.kickIndex).toBe(10);
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s10), phase: "done" as const };
    expect(reducer(done, { type: "kick" })).toBe(done);
  });
});

describe("reducer — set controls", () => {
  it("set-angle clamps to 0-1", () => {
    const s = initialState(1, s10);
    expect(reducer(s, { type: "set-angle", value: -0.5 }).angle).toBe(0);
    expect(reducer(s, { type: "set-angle", value: 1.5 }).angle).toBe(1);
  });

  it("set-power updates power", () => {
    const s = initialState(1, s10);
    expect(reducer(s, { type: "set-power", value: 0.8 }).power).toBeCloseTo(0.8);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s10))).toBeNull();
  });

  it("1000 for perfect session", () => {
    const done = { ...initialState(1, s10), phase: "done" as const, goodCount: 10, totalKicks: 10, kickIndex: 10 };
    expect(isTerminal(done)!.score).toBe(1000);
  });

  it("proportional for partial", () => {
    const done = { ...initialState(1, s10), phase: "done" as const, goodCount: 6, totalKicks: 10, kickIndex: 10 };
    expect(isTerminal(done)!.score).toBe(600);
  });
});
