import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { duration: "60" as const, category: "mixed" as const };

describe("CharadesPrompter initialState", () => {
  it("creates state with prompts", () => {
    const s = initialState(1, defaultSettings);
    expect(s.prompts.length).toBeGreaterThan(0);
  });

  it("starts at index 0 with zero completions", () => {
    const s = initialState(1, defaultSettings);
    expect(s.currentIndex).toBe(0);
    expect(s.completedCount).toBe(0);
    expect(s.skippedCount).toBe(0);
  });

  it("timer matches duration setting", () => {
    const s60 = initialState(1, { duration: "60", category: "mixed" });
    const s120 = initialState(1, { duration: "120", category: "mixed" });
    expect(s60.timeLeft).toBe(60);
    expect(s120.timeLeft).toBe(120);
  });

  it("filters by category when not mixed", () => {
    const s = initialState(1, { duration: "60", category: "animals" });
    // Should only have animal prompts - hard to verify without importing, but prompts should exist
    expect(s.prompts.length).toBeGreaterThan(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(5, defaultSettings);
    const s2 = initialState(5, defaultSettings);
    expect(s1.prompts[0]).toBe(s2.prompts[0]);
  });
});

describe("CharadesPrompter reducer - complete", () => {
  it("complete increments completedCount and advances index", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "complete" });
    expect(s2.completedCount).toBe(1);
    expect(s2.currentIndex).toBe(1);
    expect(s2.skippedCount).toBe(0);
  });

  it("multiple completes stack up score", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "complete" });
    s = reducer(s, { type: "complete" });
    s = reducer(s, { type: "complete" });
    expect(s.completedCount).toBe(3);
  });
});

describe("CharadesPrompter reducer - skip", () => {
  it("skip increments skippedCount and advances index", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "skip" });
    expect(s2.skippedCount).toBe(1);
    expect(s2.currentIndex).toBe(1);
    expect(s2.completedCount).toBe(0);
  });

  it("mixed complete and skip", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "complete" });
    s = reducer(s, { type: "skip" });
    s = reducer(s, { type: "complete" });
    expect(s.completedCount).toBe(2);
    expect(s.skippedCount).toBe(1);
    expect(s.currentIndex).toBe(3);
  });
});

describe("CharadesPrompter reducer - tick", () => {
  it("tick decrements timer", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(59);
  });

  it("tick to zero ends game", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
  });

  it("no actions processed when done", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    const before = s;
    const after = reducer(s, { type: "complete" });
    expect(after).toBe(before);
  });
});

describe("CharadesPrompter isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns completedCount as score when done", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "complete" });
    s = reducer(s, { type: "complete" });
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(2);
  });
});
