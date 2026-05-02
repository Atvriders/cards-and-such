import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  averageMs,
  calcScore,
  TOTAL_TRIALS,
  MIN_DELAY_MS,
  MAX_DELAY_MS,
} from "./state.js";

function runFullGame(seed: number, reactionMs: number) {
  let s = initialState(seed);
  for (let i = 0; i < TOTAL_TRIALS; i++) {
    s = reducer(s, { type: "appear", now: i * 10_000 });
    s = reducer(s, { type: "click", now: i * 10_000 + reactionMs });
  }
  return s;
}

describe("SpeedTest initialState", () => {
  it("starts in waiting phase with no target", () => {
    const s = initialState(42);
    expect(s.phase).toBe("waiting");
    expect(s.target).toBeNull();
    expect(s.trial).toBe(0);
    expect(s.totalTrials).toBe(TOTAL_TRIALS);
    expect(s.reactionTimes).toEqual([]);
    expect(s.best).toBeNull();
  });

  it("seeds an initial pendingDelay within configured range", () => {
    const s = initialState(123);
    expect(s.pendingDelay).toBeGreaterThanOrEqual(MIN_DELAY_MS);
    expect(s.pendingDelay).toBeLessThan(MAX_DELAY_MS);
  });

  it("same seed produces same first delay and first target position", () => {
    const a = initialState(7);
    const b = initialState(7);
    expect(a.pendingDelay).toBe(b.pendingDelay);
    const a1 = reducer(a, { type: "appear", now: 1000 });
    const b1 = reducer(b, { type: "appear", now: 1000 });
    expect(a1.target?.x).toBeCloseTo(b1.target?.x ?? -1);
    expect(a1.target?.y).toBeCloseTo(b1.target?.y ?? -1);
  });
});

describe("SpeedTest reducer", () => {
  it("appear creates a target and moves to ready phase", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "appear", now: 1000 });
    expect(s2.phase).toBe("ready");
    expect(s2.target).not.toBeNull();
    expect(s2.target?.appearAt).toBe(1000);
  });

  it("appear is ignored when not in waiting phase", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "appear", now: 1000 });
    const s3 = reducer(s2, { type: "appear", now: 2000 });
    expect(s3.target?.appearAt).toBe(1000); // unchanged
  });

  it("click during waiting is ignored (no penalty, no reaction recorded)", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "click", now: 500 });
    expect(s2).toBe(s);
    expect(s2.reactionTimes).toEqual([]);
  });

  it("click during ready records reaction time and returns to waiting", () => {
    const s0 = initialState(42);
    const s1 = reducer(s0, { type: "appear", now: 1000 });
    const s2 = reducer(s1, { type: "click", now: 1275 });
    expect(s2.phase).toBe("waiting");
    expect(s2.target).toBeNull();
    expect(s2.reactionTimes).toEqual([275]);
    expect(s2.trial).toBe(1);
    expect(s2.pendingDelay).toBeGreaterThanOrEqual(MIN_DELAY_MS);
    expect(s2.pendingDelay).toBeLessThan(MAX_DELAY_MS);
  });

  it("setBest updates the best field", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "setBest", best: 234 });
    expect(s2.best).toBe(234);
    const s3 = reducer(s2, { type: "setBest", best: null });
    expect(s3.best).toBeNull();
  });
});

describe("SpeedTest game flow", () => {
  it("ends after 10 trials and exposes a positive score", () => {
    const s = runFullGame(42, 250);
    expect(s.phase).toBe("ended");
    expect(s.reactionTimes).toHaveLength(TOTAL_TRIALS);
    expect(s.target).toBeNull();
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    expect(term?.score).toBeGreaterThan(0);
  });

  it("isTerminal returns null while running", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    const s2 = reducer(s, { type: "appear", now: 1000 });
    expect(isTerminal(s2)).toBeNull();
  });

  it("further actions after end are no-ops", () => {
    const s = runFullGame(42, 250);
    const s2 = reducer(s, { type: "appear", now: 999_999 });
    const s3 = reducer(s, { type: "click", now: 999_999 });
    expect(s2.phase).toBe("ended");
    expect(s3.phase).toBe("ended");
  });
});

describe("SpeedTest averageMs and calcScore", () => {
  it("averageMs is 0 with no recorded reactions", () => {
    const s = initialState(42);
    expect(averageMs(s)).toBe(0);
    expect(calcScore(s)).toBe(0);
  });

  it("averageMs computes mean reaction time", () => {
    const s = { ...initialState(42), reactionTimes: [200, 300, 400] };
    expect(averageMs(s)).toBe(300);
  });

  it("faster average yields a higher score", () => {
    const fast = { ...initialState(42), reactionTimes: Array(10).fill(200) };
    const slow = { ...initialState(42), reactionTimes: Array(10).fill(500) };
    expect(calcScore(fast)).toBeGreaterThan(calcScore(slow));
  });
});
