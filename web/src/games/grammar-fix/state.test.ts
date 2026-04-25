import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questionCount: "5" as const };

describe("GrammarFix initialState", () => {
  it("creates correct number of entries", () => {
    const s = initialState(42, defaultSettings);
    expect(s.entries.length).toBe(5);
    expect(s.current).toBe(0);
    expect(s.score).toBe(0);
    expect(s.done).toBe(false);
  });

  it("each entry has 3-4 choices including the answer", () => {
    const s = initialState(99, defaultSettings);
    for (const entry of s.entries) {
      expect(entry.choices.length).toBeGreaterThanOrEqual(2);
      expect(entry.choices).toContain(entry.answer);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(7, defaultSettings);
    const s2 = initialState(7, defaultSettings);
    expect(s1.entries.map((e) => e.sentence)).toEqual(s2.entries.map((e) => e.sentence));
  });

  it("each entry has a non-empty explanation", () => {
    const s = initialState(42, defaultSettings);
    for (const entry of s.entries) {
      expect(entry.explanation.length).toBeGreaterThan(10);
    }
  });
});

describe("GrammarFix reducer", () => {
  it("correct selection scores 10", () => {
    const s = initialState(42, defaultSettings);
    const entry = s.entries[0]!;
    const correctIdx = entry.choices.indexOf(entry.answer);
    const s2 = reducer(s, { type: "select", index: correctIdx });
    expect(s2.score).toBe(10);
  });

  it("wrong selection scores 0", () => {
    const s = initialState(42, defaultSettings);
    const entry = s.entries[0]!;
    const correctIdx = entry.choices.indexOf(entry.answer);
    const wrongIdx = correctIdx === 0 ? 1 : 0;
    const s2 = reducer(s, { type: "select", index: wrongIdx });
    expect(s2.score).toBe(0);
  });

  it("cannot select again after answering", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "select", index: 0 });
    const s3 = reducer(s2, { type: "select", index: 1 });
    expect(s3.selected).toBe(s2.selected);
  });

  it("next advances current question", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "select", index: 0 });
    s = reducer(s, { type: "next" });
    expect(s.current).toBe(1);
    expect(s.selected).toBeNull();
  });

  it("completing all questions sets done", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "select", index: 0 });
      s = reducer(s, { type: "next" });
    }
    expect(s.done).toBe(true);
  });
});

describe("GrammarFix isTerminal", () => {
  it("returns null in progress", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, defaultSettings), done: true, score: 80 };
    expect(isTerminal(s)?.score).toBe(80);
  });
});
