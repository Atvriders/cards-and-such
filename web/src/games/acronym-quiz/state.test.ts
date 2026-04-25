import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questionCount: "5" as const };

describe("AcronymQuiz initialState", () => {
  it("creates correct number of entries", () => {
    const s = initialState(42, defaultSettings);
    expect(s.entries.length).toBe(5);
    expect(s.current).toBe(0);
    expect(s.score).toBe(0);
    expect(s.done).toBe(false);
  });

  it("each entry has 4 choices including the answer", () => {
    const s = initialState(99, defaultSettings);
    for (const entry of s.entries) {
      expect(entry.choices.length).toBe(4);
      expect(entry.choices).toContain(entry.answer);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(7, defaultSettings);
    const s2 = initialState(7, defaultSettings);
    expect(s1.entries.map(e => e.acronym)).toEqual(s2.entries.map(e => e.acronym));
  });

  it("produces different questions for different seeds", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(2, defaultSettings);
    const q1 = s1.entries.map(e => e.acronym).join();
    const q2 = s2.entries.map(e => e.acronym).join();
    expect(q1).not.toBe(q2);
  });
});

describe("AcronymQuiz reducer", () => {
  it("correct selection increases score by 10", () => {
    const s = initialState(42, defaultSettings);
    const entry = s.entries[0]!;
    const correctIdx = entry.choices.indexOf(entry.answer);
    const s2 = reducer(s, { type: "select", index: correctIdx });
    expect(s2.score).toBe(10);
    expect(s2.selected).toBe(correctIdx);
  });

  it("wrong selection does not increase score", () => {
    const s = initialState(42, defaultSettings);
    const entry = s.entries[0]!;
    const correctIdx = entry.choices.indexOf(entry.answer);
    const wrongIdx = correctIdx === 0 ? 1 : 0;
    const s2 = reducer(s, { type: "select", index: wrongIdx });
    expect(s2.score).toBe(0);
    expect(s2.selected).toBe(wrongIdx);
  });

  it("cannot select again after already selected", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "select", index: 0 });
    const s3 = reducer(s2, { type: "select", index: 1 });
    expect(s3.selected).toBe(s2.selected);
  });

  it("next advances to next question", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "select", index: 0 });
    s = reducer(s, { type: "next" });
    expect(s.current).toBe(1);
    expect(s.selected).toBeNull();
  });

  it("completing all questions sets done to true", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "select", index: 0 });
      s = reducer(s, { type: "next" });
    }
    expect(s.done).toBe(true);
  });
});

describe("AcronymQuiz isTerminal", () => {
  it("returns null while in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, defaultSettings), done: true, score: 50 };
    expect(isTerminal(s)?.score).toBe(50);
  });
});
