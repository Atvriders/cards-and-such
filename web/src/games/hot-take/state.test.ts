import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "10" as const };

describe("HotTake initialState", () => {
  it("creates correct number of takes", () => {
    const s = initialState(1, defaultSettings);
    expect(s.takes.length).toBe(10);
  });

  it("starts with 0 agrees and disagrees", () => {
    const s = initialState(1, defaultSettings);
    expect(s.agreeCount).toBe(0);
    expect(s.disagreeCount).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(123, defaultSettings);
    const s2 = initialState(123, defaultSettings);
    expect(s1.takes).toEqual(s2.takes);
  });

  it("all takes are non-empty strings", () => {
    const s = initialState(1, defaultSettings);
    for (const t of s.takes) {
      expect(typeof t).toBe("string");
      expect(t.length).toBeGreaterThan(0);
    }
  });
});

describe("HotTake reducer", () => {
  it("agree increments agreeCount", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "agree" });
    expect(s2.agreeCount).toBe(1);
    expect(s2.currentIndex).toBe(1);
  });

  it("disagree increments disagreeCount", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "disagree" });
    expect(s2.disagreeCount).toBe(1);
    expect(s2.currentIndex).toBe(1);
  });

  it("skip advances without incrementing counts", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "skip" });
    expect(s2.agreeCount).toBe(0);
    expect(s2.disagreeCount).toBe(0);
    expect(s2.currentIndex).toBe(1);
  });

  it("finishes after all takes", () => {
    let s = initialState(1, { rounds: "10" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "agree" });
    expect(s.phase).toBe("done");
  });
});

describe("HotTake isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns agreeCount as score when done", () => {
    let s = initialState(1, { rounds: "10" as const });
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "agree" });
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "disagree" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(5);
  });
});
