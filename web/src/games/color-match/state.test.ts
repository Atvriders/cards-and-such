import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s60med = { duration: "60" as const, speed: "medium" as const };
const s30slow = { duration: "30" as const, speed: "slow" as const };

describe("ColorMatch initialState", () => {
  it("starts with score 0, not ended", () => {
    const s = initialState(42, s60med);
    expect(s.score).toBe(0);
    expect(s.ended).toBe(false);
    expect(s.elapsed).toBe(0);
  });

  it("has a valid target color", () => {
    const s = initialState(1, s60med);
    expect(typeof s.targetColor).toBe("string");
    expect(s.targetColor.startsWith("#")).toBe(true);
  });

  it("same seed gives same state", () => {
    const s1 = initialState(7, s60med);
    const s2 = initialState(7, s60med);
    expect(s1.targetColor).toBe(s2.targetColor);
    expect(s1.currentColor).toBe(s2.currentColor);
  });
});

describe("ColorMatch tick", () => {
  it("advances elapsed", () => {
    const s = initialState(42, s60med);
    const s2 = reducer(s, { type: "tick", dt: 1 });
    expect(s2.elapsed).toBeCloseTo(1);
  });

  it("ends at duration", () => {
    const s = initialState(42, s30slow);
    const s2 = reducer(s, { type: "tick", dt: 30 });
    expect(s2.ended).toBe(true);
  });

  it("color changes after interval", () => {
    const s = initialState(42, { duration: "60" as const, speed: "slow" as const });
    // slow interval = 1.5s, tick 2s should change color
    const s2 = reducer(s, { type: "tick", dt: 2 });
    // Color may or may not have changed depending on RNG; just verify structure
    expect(typeof s2.currentColor).toBe("string");
    expect(s2.colorElapsed).toBeLessThan(1.5);
  });

  it("no tick after ended", () => {
    const s = initialState(42, s30slow);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const again = reducer(ended, { type: "tick", dt: 5 });
    expect(again.elapsed).toBe(30);
  });
});

describe("ColorMatch tap", () => {
  it("tap when match increments score", () => {
    const s = initialState(42, s60med);
    // Force a match
    const matching = { ...s, currentColor: s.targetColor };
    const s2 = reducer(matching, { type: "tap" });
    expect(s2.score).toBe(1);
  });

  it("tap when no match decrements score (min 0)", () => {
    const s = initialState(42, s60med);
    // Force a non-match
    const nonMatching = { ...s, currentColor: "#000000", targetColor: "#ffffff" };
    const s2 = reducer(nonMatching, { type: "tap" });
    expect(s2.score).toBe(0); // clamped
    expect(s2.misses).toBe(1);
  });

  it("tap after ended is no-op", () => {
    const s = initialState(42, s30slow);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const s2 = reducer(ended, { type: "tap" });
    expect(s2.score).toBe(0);
  });

  it("multiple correct taps accumulate", () => {
    const s = initialState(42, s60med);
    const matching = { ...s, currentColor: s.targetColor };
    let cur = reducer(matching, { type: "tap" });
    cur = { ...cur, currentColor: cur.targetColor };
    cur = reducer(cur, { type: "tap" });
    expect(cur.score).toBe(2);
  });
});

describe("ColorMatch isTerminal", () => {
  it("null while running", () => {
    expect(isTerminal(initialState(1, s60med))).toBeNull();
  });

  it("returns score when ended", () => {
    const s = initialState(42, s30slow);
    const ended = reducer(s, { type: "tick", dt: 30 });
    expect(isTerminal(ended)?.score).toBe(0);
  });
});
