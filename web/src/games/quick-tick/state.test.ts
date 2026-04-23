import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TICKS, POINTS_PERFECT, POINTS_GOOD } from "./state.js";

const settings = { dummy: true };

describe("QuickTick initialState", () => {
  it("starts in waiting phase with zero score", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("waiting");
    expect(s.score).toBe(0);
    expect(s.tickNumber).toBe(0);
    expect(s.tickOffsets.length).toBe(TOTAL_TICKS);
  });

  it("is deterministic for same seed", () => {
    expect(initialState(42, settings)).toEqual(initialState(42, settings));
  });
});

describe("QuickTick start action", () => {
  it("transitions to ticking phase", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("ticking");
  });

  it("start ignored outside waiting phase", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "start" });
    expect(s3.phase).toBe("ticking");
  });
});

describe("QuickTick tap action", () => {
  it("perfect tap gives 10 points", () => {
    const s = initialState(5, settings);
    const ticking = reducer(s, { type: "start" });
    const s2 = reducer(ticking, { type: "tap", timingMs: 10 });
    expect(s2.lastPoints).toBe(POINTS_PERFECT);
    expect(s2.score).toBe(POINTS_PERFECT);
  });

  it("good tap gives 5 points", () => {
    const s = initialState(5, settings);
    const ticking = reducer(s, { type: "start" });
    const s2 = reducer(ticking, { type: "tap", timingMs: 100 });
    expect(s2.lastPoints).toBe(POINTS_GOOD);
  });

  it("miss tap gives 0 points", () => {
    const s = initialState(5, settings);
    const ticking = reducer(s, { type: "start" });
    const s2 = reducer(ticking, { type: "tap", timingMs: 400 });
    expect(s2.lastPoints).toBe(0);
    expect(s2.score).toBe(0);
  });

  it("completes game after 20 taps", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "start" });
    for (let i = 0; i < TOTAL_TICKS; i++) {
      s = reducer(s, { type: "tap", timingMs: 0 });
    }
    expect(s.phase).toBe("done");
    expect(s.score).toBe(TOTAL_TICKS * POINTS_PERFECT);
  });
});

describe("QuickTick terminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(1, settings);
    const done = { ...s, phase: "done" as const, score: 80 };
    expect(isTerminal(done)!.score).toBe(80);
  });
});
