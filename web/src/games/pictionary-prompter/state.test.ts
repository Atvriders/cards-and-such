import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { duration: "60" as const, category: "mixed" as const };

describe("PictionaryPrompter initialState", () => {
  it("creates state with prompts", () => {
    const s = initialState(1, defaultSettings);
    expect(s.prompts.length).toBeGreaterThan(0);
  });

  it("starts at index 0 with zero completions", () => {
    const s = initialState(1, defaultSettings);
    expect(s.currentIndex).toBe(0);
    expect(s.completedCount).toBe(0);
    expect(s.skippedCount).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("timer matches duration setting", () => {
    const s60 = initialState(1, { duration: "60", category: "mixed" });
    const s180 = initialState(1, { duration: "180", category: "mixed" });
    expect(s60.timeLeft).toBe(60);
    expect(s180.timeLeft).toBe(180);
  });

  it("filters by category", () => {
    const s = initialState(1, { duration: "60", category: "animals" });
    expect(s.prompts.every(p => p.category === "animals")).toBe(true);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(7, defaultSettings);
    const s2 = initialState(7, defaultSettings);
    expect(s1.prompts[0]!.word).toBe(s2.prompts[0]!.word);
  });

  it("each prompt has word, category, and difficulty", () => {
    const s = initialState(1, defaultSettings);
    const p = s.prompts[0]!;
    expect(typeof p.word).toBe("string");
    expect(["objects","animals","places","actions","food"]).toContain(p.category);
    expect(["easy","medium","hard"]).toContain(p.difficulty);
  });
});

describe("PictionaryPrompter reducer - complete", () => {
  it("complete increments completedCount", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "complete" });
    expect(s2.completedCount).toBe(1);
    expect(s2.currentIndex).toBe(1);
  });

  it("multiple completes accumulate", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "complete" });
    }
    expect(s.completedCount).toBe(5);
  });
});

describe("PictionaryPrompter reducer - skip", () => {
  it("skip increments skippedCount", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "skip" });
    expect(s2.skippedCount).toBe(1);
    expect(s2.completedCount).toBe(0);
    expect(s2.currentIndex).toBe(1);
  });

  it("complete and skip are independent counters", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "complete" });
    s = reducer(s, { type: "skip" });
    s = reducer(s, { type: "complete" });
    s = reducer(s, { type: "skip" });
    expect(s.completedCount).toBe(2);
    expect(s.skippedCount).toBe(2);
  });
});

describe("PictionaryPrompter reducer - tick", () => {
  it("tick decrements timeLeft", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(59);
  });

  it("tick to zero ends game", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
    expect(s.timeLeft).toBe(0);
  });

  it("actions blocked after done", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    const before = s;
    expect(reducer(s, { type: "complete" })).toBe(before);
    expect(reducer(s, { type: "skip" })).toBe(before);
  });
});

describe("PictionaryPrompter isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns completedCount as score when done", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "complete" });
    s = reducer(s, { type: "complete" });
    s = reducer(s, { type: "complete" });
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(3);
  });
});
